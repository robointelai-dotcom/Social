import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { LogIn, Plus, Trash, UploadCloud } from "lucide-react";
import type {
  AccountFormData,
  IAccountDao,
  IMobile,
  ISocialPlatform,
} from "@shared/types";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";

const Accounts = () => {
  const { callApi, loading } = useApi<any[]>();
  const [accounts, setAccounts] = useState<IAccountDao[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [devices, setDevices] = useState<IMobile[]>([]);
  // bulk upload state for accounts
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  // filters
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<ISocialPlatform | "all">(
    "all"
  );

  const fetchDevices = async () => {
    const res = await callApi("/mobiles/dropdown", "get", undefined, false);
    if (res) setDevices(res);
  };

  // rows for bulk add (editable form rows)
  const emptyRow = (): AccountFormData => ({
    platform: "instagram",
    username: "",
    password: "",
    deviceId: "",
  });

  const [rows, setRows] = useState<Array<AccountFormData>>([emptyRow()]);

  const fetchAccounts = async () => {
    // build query params from filters
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (platformFilter && platformFilter !== "all")
      params.append("platform", platformFilter);
    const url = `/accounts${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await callApi(url, "get", undefined, false);
    if (res) setAccounts(res as IAccountDao[]);
  };

  useEffect(() => {
    fetchAccounts();
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce filters (search/platform) and refetch
  useEffect(() => {
    const t = setTimeout(() => {
      fetchAccounts();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, platformFilter]);

  const importAccountsFromRows = async () => {
    // client-side validation
    const ok = rows.every(
      (r) => r.deviceId && r.username && r.password && r.platform
    );
    if (!ok) {
      toast.error(
        "Each account must have device, username, password and platform"
      );
      return;
    }

    const payload = rows.map((r) => ({
      username: r.username,
      password: r.password,
      platform: r.platform,
      mobileId: r.deviceId,
    }));

    const res = await callApi("/accounts", "post", payload, true);

    if (res) {
      setSheetOpen(false);
      setRows([emptyRow()]);
      fetchAccounts();
    }
  };

  const submitBulkAccounts = async () => {
    if (!bulkFile) {
      toast.error("Please select a file to upload (CSV/XLS/XLSX)");
      return;
    }
    setBulkSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("media", bulkFile);
      const res = await callApi("/accounts/bulk", "post", fd, true);
      if (res) {
        setBulkSheetOpen(false);
        setBulkFile(null);
        fetchAccounts();
      }
    } catch (err) {
      toast.error("Bulk upload failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const deleteAccount = async (id?: string) => {
    if (!id) return;
    // try delete on backend; if backend doesn't support it, user will see an error
    const res = await callApi(`/accounts/${id}`, "delete");
    if (res !== undefined) {
      fetchAccounts();
    }
  };

  const loginAccount = async (id?: string) => {
    if (!id) return;
    await callApi(`/accounts/${id}/login`, "get");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Accounts</h2>
          <Input
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            className="w-64"
          />
          <Select
            value={platformFilter}
            onValueChange={(val: ISocialPlatform | "all") =>
              setPlatformFilter(val)
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="instagram">instagram</SelectItem>
              <SelectItem value="facebook">facebook</SelectItem>
              <SelectItem value="tik-tok">tik-tok</SelectItem>
              <SelectItem value="youtube">youtube</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="hover:cursor-pointer"
            onClick={() => {
              setSearch("");
              setPlatformFilter("all");
            }}
          >
            Clear
          </Button>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="hover:cursor-pointer"
              onClick={() => setSheetOpen(true)}
            >
              <Plus />
              Add accounts
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[95%] sm:max-w-4xl">
            <SheetHeader>
              <SheetTitle>Bulk add accounts</SheetTitle>
              <SheetDescription>
                Add multiple accounts to automate
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 space-y-3">
              {rows.map((r, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1">
                      Platform
                    </label>
                    <Select
                      value={r.platform}
                      onValueChange={(val: ISocialPlatform) => {
                        const clone = [...rows];
                        clone[idx] = {
                          ...clone[idx],
                          platform: val,
                        };
                        setRows(clone);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">instagram</SelectItem>
                        <SelectItem value="facebook">facebook</SelectItem>
                        <SelectItem value="tik-tok">tik-tok</SelectItem>
                        <SelectItem value="youtube">youtube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm text-muted-foreground mb-1">
                      Device
                    </label>
                    <Select
                      value={r.deviceId}
                      onValueChange={(val: string) => {
                        const clone = [...rows];
                        clone[idx] = {
                          ...clone[idx],
                          deviceId: val,
                        };
                        setRows(clone);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm text-muted-foreground mb-1">
                      Username
                    </label>
                    <Input
                      value={r.username}
                      onChange={(e) => {
                        const clone = [...rows];
                        clone[idx] = {
                          ...clone[idx],
                          username: e.target.value,
                        };
                        setRows(clone);
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm text-muted-foreground mb-1">
                      Password
                    </label>
                    <Input
                      value={r.password}
                      onChange={(e) => {
                        const clone = [...rows];
                        clone[idx] = {
                          ...clone[idx],
                          password: e.target.value,
                        };
                        setRows(clone);
                      }}
                    />
                  </div>

                  <div className="col-span-1 flex gap-2">
                    <Button
                      variant="outline"
                      className="hover:cursor-pointer"
                      size="sm"
                      onClick={() => {
                        const clone = rows.filter((_, i) => i !== idx);
                        setRows(clone.length ? clone : [emptyRow()]);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hover:cursor-pointer"
                  size="sm"
                  onClick={() => setRows([...rows, emptyRow()])}
                >
                  Add row
                </Button>
                <div className="text-sm text-muted-foreground">
                  {rows.length} rows
                </div>
              </div>
            </div>

            <SheetFooter>
              <div className="flex gap-2 justify-end w-full">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="hover:cursor-pointer"
                    onClick={() => setSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  className="hover:cursor-pointer"
                  onClick={async () => {
                    // client-side validation
                    const ok = rows.every(
                      (r) =>
                        r.deviceId && r.username && r.password && r.platform
                    );
                    if (!ok) {
                      toast.error("Please fill all fields for each row");
                      return;
                    }
                    await importAccountsFromRows();
                  }}
                >
                  Import
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Sheet open={bulkSheetOpen} onOpenChange={setBulkSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="hover:cursor-pointer ml-2"
              onClick={() => setBulkSheetOpen(true)}
            >
              <UploadCloud />
              Bulk Upload
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[40%] sm:max-w-3xl">
            <SheetHeader>
              <SheetTitle>Bulk upload accounts</SheetTitle>
              <SheetDescription>
                Upload a CSV or Excel file containing accounts in the format of
                (platform,username,password,mobileId)
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 space-y-4 overflow-auto max-h-[70vh]">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  File (CSV / XLS / XLSX)
                </label>
                <Input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => {
                    const f =
                      (e.target as HTMLInputElement).files &&
                      (e.target as HTMLInputElement).files![0];
                    if (f) {
                      setBulkFile(f);
                    } else {
                      setBulkFile(null);
                    }
                  }}
                />
                {bulkFile ? (
                  <div className="text-sm text-muted-foreground mt-2">
                    Selected: {bulkFile.name}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2">
                    Select a CSV or Excel file to upload.
                  </div>
                )}
              </div>
            </div>

            <SheetFooter>
              <div className="flex gap-2 justify-end w-full">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="hover:cursor-pointer"
                    onClick={() => setBulkSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  className="hover:cursor-pointer"
                  onClick={submitBulkAccounts}
                  disabled={!bulkFile || bulkSubmitting}
                >
                  {bulkSubmitting ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <Loader size="large" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.length ? (
              accounts.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>{a.mobile?.serialName}</TableCell>
                  <TableCell>{a.platform}</TableCell>
                  <TableCell>{a.username}</TableCell>
                  <TableCell>
                    <code className="text-sm">{a.password}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="hover:cursor-pointer"
                        size="sm"
                        onClick={() => loginAccount(a._id)}
                      >
                        <LogIn />
                      </Button>

                      <Button
                        variant="destructive"
                        className="hover:cursor-pointer"
                        size="sm"
                        onClick={() => deleteAccount(a._id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Accounts;
