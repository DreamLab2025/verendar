import { BookingHistoryList } from "./booking-history-list";

/** Ôm sát header + sidebar: không max-width, padding tối thiểu. */
export default function BookingHistoryPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 pt-1 sm:px-3 sm:pb-3 sm:pt-2 lg:px-4">
      <BookingHistoryList />
    </div>
  );
}
