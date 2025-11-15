// resources/js/ui/calendar.jsx
import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

/**
 * Calendar wrapper: sin dependencias de utils/buttonVariants.
 * Acepta props del DayPicker (mode="single" | "range", selected, onSelect, numberOfMonths, etc.)
 */
export function Calendar(props) {
  return (
    <>
      <style>{`
        /* Ajuste visual para que combine con tus cards */
        .rdp {
          --rdp-accent-color: #4d82bc;
          --rdp-background-color: #f7faff;
          margin: 6px;
        }
        .rdp-button_reset {
          border-radius: 10px;
        }
        .rdp-day_selected,
        .rdp-day_selected:focus-visible,
        .rdp-day_selected:hover {
          background-color: #4d82bc;
          color: #fff;
        }
        .rdp-day_range_start,
        .rdp-day_range_end {
          background-color: #4d82bc !important;
          color: #fff !important;
        }
        .rdp-day_range_middle {
          background-color: #eef4ff !important;
          color: #0f172a !important;
        }
        .rdp-nav_button {
          border-radius: 999px;
          box-shadow: 0 6px 14px rgba(2,6,23,.08);
        }
        .rdp-caption_label {
          font-weight: 800;
          color: #0f172a;
        }
        .rdp-head_cell {
          color: #173b8f;
          font-weight: 700;
        }
        .rdp-day {
          border-radius: 10px;
        }
      `}</style>

      <DayPicker
        showOutsideDays
        fixedWeeks
        {...props}
      />
    </>
  );
}

export default Calendar;
