"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar, Download, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface MeterReading {
  timestamp: number;
  meter_id: string;
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  energy: number;
}

interface MeterData {
  [meterId: string]: {
    readings: Array<MeterReading & { formattedTime: string }>;
    latest: MeterReading;
  };
}

const fetchWeeklyReportData = async (): Promise<MeterData> => {
  try {
    const response = await fetch("http://localhost:8000/api/readings");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const readings: MeterReading[] = await response.json();
    console.log(readings);

    // Filter readings to only include the previous week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyReadings = readings.filter(
      (reading) => reading.timestamp * 1000 >= oneWeekAgo
    );
    console.log(weeklyReadings);

    // Group readings by meter_id
    const data: MeterData = {};

    weeklyReadings.forEach((reading) => {
      if (!data[reading.meter_id]) {
        data[reading.meter_id] = {
          readings: [],
          latest: reading,
        };
      }

      // Add formatted time for display
      const readingWithTime = {
        ...reading,
        formattedTime: new Date(reading.timestamp).toLocaleString(),
      };

      data[reading.meter_id].readings.push(readingWithTime);

      // Update latest reading if this one is more recent
      if (reading.timestamp > data[reading.meter_id].latest.timestamp) {
        data[reading.meter_id].latest = reading;
      }
    });

    // Sort readings by timestamp (newest first)
    Object.keys(data).forEach((meterId) => {
      data[meterId].readings.sort((a, b) => b.timestamp - a.timestamp);
    });

    return data;
  } catch (error) {
    console.error("Error fetching meter readings:", error);
    return {};
  }
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<MeterData>({});
  const [selectedMeter, setSelectedMeter] = useState<string>("all");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchWeeklyReportData();
        setReportData(data);
      } catch (err) {
        setError("Failed to load meter data");
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const meterIds = Object.keys(reportData);

  // Calculate summary statistics
  const calculateSummary = (meterId?: string) => {
    const meters = meterId && meterId !== "all" ? [meterId] : meterIds;
    let totalReadings = 0;
    let avgVoltage = 0;
    let avgCurrent = 0;
    let avgPower = 0;
    let totalEnergy = 0;
    let maxPower = 0;
    let minVoltage = Number.POSITIVE_INFINITY;

    meters.forEach((id) => {
      const meter = reportData[id];
      if (meter) {
        totalReadings += meter.readings.length;
        meter.readings.forEach((reading) => {
          avgVoltage += reading.voltage;
          avgCurrent += reading.current;
          avgPower += reading.power;
          totalEnergy += reading.energy;
          maxPower = Math.max(maxPower, reading.power);
          minVoltage = Math.min(minVoltage, reading.voltage);
        });
      }
    });

    const readingCount = totalReadings;
    return {
      totalReadings: readingCount,
      avgVoltage: Math.round((avgVoltage / readingCount) * 100) / 100,
      avgCurrent: Math.round((avgCurrent / readingCount) * 100) / 100,
      avgPower: Math.round((avgPower / readingCount) * 100) / 100,
      totalEnergy: Math.round(totalEnergy * 100) / 100,
      maxPower: Math.round(maxPower * 100) / 100,
      minVoltage: Math.round(minVoltage * 100) / 100,
    };
  };

  const summary = calculateSummary(selectedMeter);

  // Get chart data for selected meter or aggregated data
  const getChartData = () => {
    if (selectedMeter === "all") {
      // Aggregate data by day
      const aggregatedData: {
        [day: string]: {
          voltage: number[];
          current: number[];
          power: number[];
          count: number;
        };
      } = {};

      meterIds.forEach((meterId) => {
        const meter = reportData[meterId];
        if (meter) {
          meter.readings.forEach((reading) => {
            const day = new Date(reading.timestamp).toLocaleDateString();
            if (!aggregatedData[day]) {
              aggregatedData[day] = {
                voltage: [],
                current: [],
                power: [],
                count: 0,
              };
            }
            aggregatedData[day].voltage.push(reading.voltage);
            aggregatedData[day].current.push(reading.current);
            aggregatedData[day].power.push(reading.power);
            aggregatedData[day].count++;
          });
        }
      });

      return Object.entries(aggregatedData)
        .map(([day, data]) => ({
          day,
          voltage:
            Math.round(
              (data.voltage.reduce((a, b) => a + b, 0) / data.voltage.length) *
                100
            ) / 100,
          current:
            Math.round(
              (data.current.reduce((a, b) => a + b, 0) / data.current.length) *
                100
            ) / 100,
          power:
            Math.round(
              (data.power.reduce((a, b) => a + b, 0) / data.power.length) * 100
            ) / 100,
        }))
        .slice(0, 7);
    } else {
      const meter = reportData[selectedMeter];
      if (!meter) return [];

      // Group by day and average
      const dailyData: {
        [day: string]: {
          voltage: number[];
          current: number[];
          power: number[];
        };
      } = {};

      meter.readings.forEach((reading) => {
        const day = new Date(reading.timestamp).toLocaleDateString();
        if (!dailyData[day]) {
          dailyData[day] = { voltage: [], current: [], power: [] };
        }
        dailyData[day].voltage.push(reading.voltage);
        dailyData[day].current.push(reading.current);
        dailyData[day].power.push(reading.power);
      });

      return Object.entries(dailyData)
        .map(([day, data]) => ({
          day,
          voltage:
            Math.round(
              (data.voltage.reduce((a, b) => a + b, 0) / data.voltage.length) *
                100
            ) / 100,
          current:
            Math.round(
              (data.current.reduce((a, b) => a + b, 0) / data.current.length) *
                100
            ) / 100,
          power:
            Math.round(
              (data.power.reduce((a, b) => a + b, 0) / data.power.length) * 100
            ) / 100,
        }))
        .slice(0, 7);
    }
  };

  const chartData = getChartData();

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("WEEKLY METER REPORT", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Report Period: Previous 7 Days`, 14, 34);
    doc.text(
      `Selected Meter: ${
        selectedMeter === "all" ? "All Meters" : selectedMeter
      }`,
      14,
      40
    );

    // Summary
    doc.setFontSize(12);
    doc.text("Summary Statistics", 14, 50);
    doc.setFontSize(10);
    const summaryData = [
      ["Total Readings", summary.totalReadings],
      ["Average Voltage (V)", summary.avgVoltage.toFixed(2)],
      ["Average Current (A)", summary.avgCurrent.toFixed(2)],
      ["Average Power (W)", summary.avgPower.toFixed(2)],
      ["Total Energy (kWh)", summary.totalEnergy.toFixed(2)],
      ["Max Power (W)", summary.maxPower.toFixed(2)],
      ["Min Voltage (V)", summary.minVoltage.toFixed(2)],
    ];
    const firstTable = autoTable(doc, {
      startY: 55,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "striped",
      styles: { fontSize: 9 },
    });

    // Daily averages
    const dailyData = chartData.map((day) => [
      day.day,
      `${day.voltage.toFixed(2)} V`,
      `${day.current.toFixed(2)} A`,
      `${day.power.toFixed(2)} W`,
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Day", "Voltage", "Current", "Power"]],
      body: dailyData,
      theme: "striped",
      styles: { fontSize: 9 },
    });

    // Meter details
    const meterDetails =
      selectedMeter === "all"
        ? meterIds.map((meterId) => {
            const meter = reportData[meterId];
            return [
              meterId,
              meter.readings.length,
              `${meter?.latest?.voltage?.toFixed(2)} V`,
              `${meter?.latest?.power?.toFixed(2)} W`,
            ];
          })
        : [
            [
              selectedMeter,
              reportData[selectedMeter]?.readings.length,
              `${reportData[selectedMeter]?.latest.voltage.toFixed(2)} V`,
              `${reportData[selectedMeter]?.latest.power.toFixed(2)} W`,
            ],
          ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Meter ID", "Readings", "Latest Voltage", "Latest Power"]],
      body: meterDetails,
      theme: "striped",
      styles: { fontSize: 9 },
    });

    // Download
    doc.save(
      `meter-report-${selectedMeter}-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    setIsGeneratingPDF(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading meter data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Weekly Reports</h1>
              <p className="text-muted-foreground">
                Previous week meter data analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}{" "}
              - {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Select meter and generate PDF report
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Meter</label>
                <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meters</SelectItem>
                    {meterIds.map((meterId) => (
                      <SelectItem key={meterId} value={meterId}>
                        {meterId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={generatePDFReport} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <>
                  <FileText className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Readings
              </CardTitle>
              <Badge variant="secondary">{summary.totalReadings}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalReadings}</div>
              <p className="text-xs text-muted-foreground">Past 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Voltage</CardTitle>
              <Badge variant="secondary">{summary.avgVoltage}V</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgVoltage}V</div>
              <p className="text-xs text-muted-foreground">
                Min: {Math.round(summary.minVoltage)}V
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Power</CardTitle>
              <Badge variant="secondary">{Math.round(summary.avgPower)}W</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(summary.avgPower)}W
              </div>
              <p className="text-xs text-muted-foreground">
                Max: {Math.round(summary.maxPower)}W
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Energy
              </CardTitle>
              <Badge variant="secondary">
                {Math.round(summary.totalEnergy)}kWh
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(summary.totalEnergy)}
              </div>
              <p className="text-xs text-muted-foreground">kWh consumed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Average Voltage</CardTitle>
              <CardDescription>
                Voltage trends over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Average Power</CardTitle>
              <CardDescription>
                Power consumption over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="power" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Readings</CardTitle>
            <CardDescription>
              Latest 10 readings from{" "}
              {selectedMeter === "all" ? "all meters" : selectedMeter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Meter ID</TableHead>
                  <TableHead>Voltage (V)</TableHead>
                  <TableHead>Current (A)</TableHead>
                  <TableHead>Power (W)</TableHead>
                  <TableHead>Frequency (Hz)</TableHead>
                  <TableHead>Energy (kWh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMeter === "all"
                  ? meterIds
                      .flatMap(
                        (meterId) =>
                          reportData[meterId]?.readings
                            .slice(-2)
                            .map((reading) => (
                              <TableRow
                                key={`${reading.meter_id}-${reading.timestamp}`}
                              >
                                <TableCell>{reading.formattedTime}</TableCell>
                                <TableCell>{reading.meter_id}</TableCell>
                                <TableCell>
                                  {Math.round(reading.voltage)}
                                </TableCell>
                                <TableCell>
                                  {Math.round(reading.current)}
                                </TableCell>
                                <TableCell>
                                  {Math.round(reading.power)}
                                </TableCell>
                                <TableCell>
                                  {Math.round(reading.frequency)}
                                </TableCell>
                                <TableCell>
                                  {Math.round(reading.energy)}
                                </TableCell>
                              </TableRow>
                            )) || []
                      )
                      .slice(0, 10)
                  : reportData[selectedMeter]?.readings
                      .slice(-10)
                      .map((reading) => (
                        <TableRow
                          key={`${reading.meter_id}-${reading.timestamp}`}
                        >
                          <TableCell>{reading.formattedTime}</TableCell>
                          <TableCell>{reading.meter_id}</TableCell>
                          <TableCell>{Math.round(reading.voltage)}</TableCell>
                          <TableCell>{Math.round(reading.current)}</TableCell>
                          <TableCell>{Math.round(reading.power)}</TableCell>
                          <TableCell>{Math.round(reading.frequency)}</TableCell>
                          <TableCell>{Math.round(reading.energy)}</TableCell>
                        </TableRow>
                      )) || []}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
