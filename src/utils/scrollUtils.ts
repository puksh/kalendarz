export function handleHorizontalScroll(
  event: WheelEvent,
  container: HTMLElement | null
): void {
  if (!container) return;

  event.preventDefault();
  const scrollAmount = event.deltaY;
  container.scrollLeft += scrollAmount;
}

export function scrollToTodayColumn(
  container: HTMLElement | null,
  currentMonth: number,
  currentYear: number,
  todayIndex: number
): void {
  if (!container) return;

  const today = new Date();
  if (today.getMonth() !== currentMonth || today.getFullYear() !== currentYear)
    return;

  // Get the column width
  const columnWidth =
    (document.querySelector('.day-cell, .calendar-table td') as HTMLElement)
      ?.offsetWidth || 0;
  const containerWidth = container.offsetWidth;

  // Calculate scroll position to center today's column
  const scrollPosition =
    columnWidth * todayIndex - containerWidth / 2 + columnWidth / 2;

  // Smooth scroll to the position
  container.scrollTo({
    left: Math.max(0, scrollPosition),
    behavior: 'smooth'
  });
}
