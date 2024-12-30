"use client";

import * as React from "react";
import { TimePickerInput } from "@/components/ui/time-picker/input";
import { TimePeriodSelect } from "@/components/ui/time-picker/period-select";
import { type Period } from "@/components/ui/time-picker/utils";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePickerBar({ date, setDate }: TimePickerDemoProps) {
  const [period, setPeriod] = React.useState<Period>("PM");

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  // const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-row gap-4 w-fit">
      <TimePickerInput
        picker="12hours"
        date={date}
        setDate={setDate}
        ref={hourRef}
        period={period}
        onRightFocus={() => minuteRef.current?.focus()}
        className="w-full place-items-center"
      />
      <span className="text-muted-foreground content-center">:</span>
      <TimePickerInput
        picker="minutes"
        date={date}
        setDate={setDate}
        ref={minuteRef}
        period={period}
        onLeftFocus={() => hourRef.current?.focus()}
        // onRightFocus={() => secondRef.current?.focus()}
        className="w-full place-items-center"
      />
      {/* <span className="text-muted-foreground content-center">:</span>
      <TimePickerInput
        picker="seconds"
        date={date}
        setDate={setDate}
        ref={secondRef}
        onLeftFocus={() => minuteRef.current?.focus()}
        className="w-full place-items-center"
      /> */}
      <TimePeriodSelect
        period={period}
        setPeriod={setPeriod}
        date={date}
        setDate={setDate}
        ref={periodRef}
        onLeftFocus={() => hourRef.current?.focus()}
      />
    </div>
  );
}