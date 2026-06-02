export function EmptyState({ message = "No records found" }: { message?: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>
  );
}
