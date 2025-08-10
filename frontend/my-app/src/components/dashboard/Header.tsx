"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"; // or react-datepicker fallback
import { Activity, CloudOff, RefreshCcw } from "lucide-react";

function Header({ isConnected, fetchData, lastUpdate }: any) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format date as YYYY-MM-DD for backend
  const formatDate = (date) => date.toISOString().split("T")[0];

  function onDateChange(date) {
    setSelectedDate(date);
    fetchData(formatDate(date));
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Meter Monitoring Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time electrical meter readings
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Datepicker using shadcn/ui */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-center text-center font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(selectedDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <ShadcnCalendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={(date) => date > new Date()} // disable future dates
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          onClick={() => fetchData(formatDate(selectedDate))}
        >
          <RefreshCcw /> Refresh
        </Button>

        {lastUpdate && (
          <p className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default Header;
