import { Activity } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../ui/card";

export default function NoData() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">No meter data available</p>
          <p className="text-muted-foreground">Waiting for data from API...</p>
        </div>
      </CardContent>
    </Card>
  );
}
