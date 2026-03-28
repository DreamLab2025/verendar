import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsCardProps {
  garageId: string;
}

export function SettingsCard({ garageId }: SettingsCardProps) {
  return (
    <Card className="max-w-xl border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Cài đặt garage</CardTitle>
        <CardDescription>Garage ID: {garageId}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Màn hình cấu hình sẽ nối API sau. Tạm thời chỉ hiển thị ngữ cảnh từ URL.
      </CardContent>
    </Card>
  );
}
