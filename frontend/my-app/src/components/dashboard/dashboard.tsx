"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Activity,
  Atom,
  AudioWaveform,
  Battery,
  CloudOff,
  Plug,
  Power,
  Radio,
  RefreshCcw,
  UtilityPole,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../ui/button";
import NoData from "./NoData";
import ValueCard, { ICardData } from "./ValueCard";
import Header from "./Header";
import { cn } from "@/lib/utils";

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

export default function Dashboard() {
  const [meterData, setMeterData] = useState<MeterData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/readings");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: MeterReading[] = await response.json();
      setIsConnected(true);
      setLastUpdate(new Date());

      // Group data by meter_id and keep last 50 readings per meter
      const groupedData: MeterData = {};

      data.forEach((reading) => {
        const meterId = reading.meter_id.toString();
        const readingWithTime = {
          ...reading,
          formattedTime: new Date(
            reading.timestamp * 1000
          ).toLocaleTimeString(),
        };

        if (!groupedData[meterId]) {
          groupedData[meterId] = {
            readings: [],
            latest: reading,
          };
        }

        groupedData[meterId].readings.push(readingWithTime);
        groupedData[meterId].latest = reading;

        // Keep only last 50 readings for performance
        if (groupedData[meterId].readings.length > 50) {
          groupedData[meterId].readings =
            groupedData[meterId].readings.slice(-50);
        }
      });

      setMeterData(groupedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for real-time updates
    const interval = setInterval(fetchData, 60_000);

    return () => clearInterval(interval);
  }, []);

  const memoizedMeterData = useMemo(() => {
    const processedData: MeterData = {};

    Object.entries(meterData).forEach(([meterId, data]) => {
      processedData[meterId] = {
        readings: data.readings,
        latest: data.latest,
      };
    });

    return processedData;
  }, [meterData]);

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(2)} ${unit}`;
  };
  const chartConfig = {
    voltage: {
      label: "Voltage",
      color: "hsl(var(--chart-1))",
    },
    current: {
      label: "Current",
      color: "hsl(var(--chart-2))",
    },
    power: {
      label: "Power",
      color: "hsl(var(--chart-3))",
    },
    frequency: {
      label: "Frequency",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          fetchData={fetchData}
        />

        {/* Meters Grid */}
        {Object.keys(memoizedMeterData).length === 0 ? (
          <NoData />
        ) : (
          <div className="grid gap-6">
            {Object.entries(memoizedMeterData).map(([meterId, data]) => (
              <div key={meterId} className="space-y-4">
                <div className="flex gap-2 items-center">
                  <div
                    className={cn(
                      "rounded-full w-3 h-3",
                      isConnected ? "bg-green-500" : "bg-rose-500"
                    )}
                  />

                  <h2 className="text-2xl font-semibold">Meter {meterId}</h2>
                </div>

                {/* Current Values Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValueCard
                    data={{
                      title: "Power",
                      unit: { label: "W", value: data.latest.power },
                      icon: Zap,
                    }}
                  />

                  <ValueCard
                    data={{
                      title: "Energy",
                      unit: { label: "kWh", value: data.latest.energy },
                      icon: Atom,
                    }}
                  />
                </div>

                {/* Charts */}
                <div className="w-full gap-6">
                  {/* Power Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Power Over Time</CardTitle>
                      <CardDescription>
                        Real-time power readings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[300px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.readings}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="formattedTime"
                              tick={{ fontSize: 12 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="power"
                              stroke="#fff"
                              strokeWidth={2}
                              dot={{
                                fill: "#fff",
                                strokeWidth: 2,
                                r: 4,
                              }}
                              fill="#fff"
                              fillOpacity={0.3}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
