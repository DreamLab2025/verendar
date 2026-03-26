'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SafeImage from '@/components/ui/SafeImage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/state';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { TruncatedText } from '@/components/ui/truncated-text';

const recentVehicles = [
  { plate: '51H-123.45', status: 'Can bao duong', mileage: '48,200 km' },
  { plate: '59A-888.99', status: 'On dinh', mileage: '17,050 km' },
  { plate: '30G-456.78', status: 'Qua han dang kiem', mileage: '92,400 km' },
];

type ServiceFormValues = {
  plate: string;
  note: string;
  remindType: string;
};

export default function Home() {
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      plate: '',
      note: '',
      remindType: 'oil-change',
    },
  });

  const [progress, setProgress] = useState(35);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [maintenanceLevel, setMaintenanceLevel] = useState('normal');
  const [statePreview, setStatePreview] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');

  const onSubmitForm = (values: ServiceFormValues) => {
    if (!values.plate.trim()) {
      form.setError('plate', { message: 'Vui long nhap bien so xe.' });
      return;
    }

    toast.success('Da luu form test UI', {
      description: `${values.plate} - ${values.remindType}`,
    });
  };

  if (statePreview === 'loading') {
    return <LoadingSkeleton propertyCount={4} className="min-h-screen bg-background" />;
  }

  if (statePreview === 'empty') {
    return <EmptyState className="min-h-screen bg-background" />;
  }

  if (statePreview === 'error') {
    return (
      <ErrorState
        className="min-h-screen bg-background"
        message="Khong the tai danh sach xe"
        detail="API /vehicles dang timeout"
        onRetry={() => {
          setStatePreview('normal');
          toast.info('Da retry state');
        }}
      />
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>UI Playground</Badge>
          <Badge variant="secondary">Verendar</Badge>
          <Badge variant="outline">Tailwind v4</Badge>
          <Badge variant="destructive">All Cases</Badge>
        </div>
        <Select
          defaultValue="normal"
          onValueChange={(value) => setStatePreview(value as 'normal' | 'loading' | 'empty' | 'error')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="State Preview" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal Page</SelectItem>
            <SelectItem value="loading">LoadingSkeleton</SelectItem>
            <SelectItem value="empty">EmptyState</SelectItem>
            <SelectItem value="error">ErrorState</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Button variants + dialog cases</CardTitle>
          <CardDescription>Test tat ca style va trang thai button/dialog.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">+</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xac nhan cap nhat lich bao duong</DialogTitle>
                  <DialogDescription>Dialog co ban de test overlay, close, keyboard ESC.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Dong</Button>
                  <Button onClick={() => toast('Da cap nhat nhac lich!')}>Xac nhan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Open AlertDialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xoa lich su bao duong?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hanh dong nay khong the hoan tac. Day la case destructive de test.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huy</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.error('Da xoa du lieu mau')}>
                    Xoa ngay
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form components + validation case</CardTitle>
          <CardDescription>Input, Textarea, Select, Checkbox, Switch, Radio, Label, Form.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bien so xe</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 51H-123.45" {...field} />
                    </FormControl>
                    <FormDescription>Nhap bien so de test state valid/invalid.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chu</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Noi dung ghi chu bao duong..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remindType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loai nhac</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chon loai dich vu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oil-change">Thay dau</SelectItem>
                        <SelectItem value="tire-rotation">Dao lop</SelectItem>
                        <SelectItem value="inspection">Dang kiem</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Submit form</Button>
            </form>
          </Form>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="free-input">Input thuong + Label</Label>
              <Input id="free-input" placeholder="Test label + input ket hop" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
              />
              <Label htmlFor="terms">Xac nhan da kiem tra thong tin lich hen</Label>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm">Bat thong bao nhac bao duong</span>
              <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
            </div>

            <div className="space-y-2">
              <Label>Muc do canh bao</Label>
              <RadioGroup value={maintenanceLevel} onValueChange={setMaintenanceLevel}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="r1" />
                  <Label htmlFor="r1">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="warning" id="r2" />
                  <Label htmlFor="r2">Warning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="r3" />
                  <Label htmlFor="r3">Critical</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Tien do hoan thanh ho so xe</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setProgress((p) => Math.min(100, p + 10))}>Tang +10%</Button>
            <Button variant="secondary" onClick={() => setProgress((p) => Math.max(0, p - 10))}>
              Giam -10%
            </Button>
            <Button variant="outline" onClick={() => setProgress(0)}>
              Reset
            </Button>
            <Button onClick={() => toast.success('Success toast')}>Toast success</Button>
            <Button variant="destructive" onClick={() => toast.error('Error toast')}>
              Toast error
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Thong tin</AlertTitle>
            <AlertDescription>Day la case alert default.</AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Canh bao quan trong</AlertTitle>
            <AlertDescription>Day la case destructive de test mau sac va icon.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data display components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableCaption>Danh sach xe gan day trong bo du lieu test.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Bien so</TableHead>
                <TableHead>Trang thai</TableHead>
                <TableHead>So km</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentVehicles.map((vehicle) => (
                <TableRow key={vehicle.plate}>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.status}</TableCell>
                  <TableCell>{vehicle.mileage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Tong so xe</TableCell>
                <TableCell>{recentVehicles.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>VK</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">Avatar fallback khi chua co anh dai dien</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom UI components</CardTitle>
          <CardDescription>SafeImage + TruncatedText + state controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border p-3">
              <p className="text-sm font-medium">SafeImage - local image</p>
              <SafeImage
                src="/next.svg"
                alt="Next Logo"
                width={220}
                height={120}
                className="rounded-lg border p-2"
              />
            </div>
            <div className="space-y-2 rounded-xl border p-3">
              <p className="text-sm font-medium">SafeImage - external fallback case</p>
              <SafeImage
                src="https://example.com/non-existing-image.png"
                alt="External fallback test"
                width={220}
                height={120}
                className="rounded-lg border"
                onError={() => toast.info('SafeImage onError triggered')}
              />
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <p className="mb-2 text-sm font-medium">TruncatedText</p>
            <TruncatedText
              as="p"
              maxWords={18}
              text="Verendar giup nguoi dung quan ly xe ca nhan, theo doi so km, dat lich bao duong, theo doi nhac thay phu tung va tim garage gan nhat mot cach de dang va truc quan tren map."
              buttonText={{ show: 'Xem them', hide: 'Thu gon' }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setStatePreview('loading')}>
              Xem LoadingSkeleton
            </Button>
            <Button variant="outline" onClick={() => setStatePreview('empty')}>
              Xem EmptyState
            </Button>
            <Button variant="outline" onClick={() => setStatePreview('error')}>
              Xem ErrorState
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleAlert className="h-3.5 w-3.5" />
            Trang nay dung de test UI, ban co the doi data de cover them edge cases.
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
