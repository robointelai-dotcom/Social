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
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { Plus } from "lucide-react";
import type { ISocialPlatform } from "@shared/types";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { formatDate } from "@/lib/utils";

const allPlatforms = ["instagram", "facebook", "tik-tok", "youtube"];
const canCancelStatus = ["Waiting", "Scheduled"];
const allTaskStatuses = [
  "Scheduled",
  "Waiting",
  "In-Progress",
  "Completed",
  "Failed",
];

const Posts = () => {
  const { callApi, loading } = useApi<any[]>();
  const [posts, setPosts] = useState<any[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<ISocialPlatform | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");

  // form state (single add)
  const [platforms, setPlatforms] = useState<ISocialPlatform[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]); // fetched dropdown accounts
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const [caption, setCaption] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const fetchPosts = async () => {
    // build query params from filters
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (platformFilter && platformFilter !== "all") {
      params.append("platform", platformFilter);
    }
    if (statusFilter && statusFilter !== "all") {
      params.append("status", statusFilter);
    }
    const url = `/posts${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await callApi(url, "get", undefined, false);
    if (res) setPosts(res as any[]);
  };

  // effect to refetch when filters change
  useEffect(() => {
    const t = setTimeout(() => {
      fetchPosts();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, platformFilter, statusFilter]);

  // when platforms selection changes, fetch accounts for those platforms
  useEffect(() => {
    const fetchAccountsForPlatforms = async () => {
      if (!platforms || platforms.length === 0) {
        setAccounts([]);
        setSelectedAccountIds([]);
        return;
      }
      const q = platforms.join(",");
      const res = await callApi(
        `/accounts/dropdown?platforms=${encodeURIComponent(q)}`,
        "get",
        undefined,
        false
      );
      if (res) {
        setAccounts(res as any[]);
        // reset selected accounts (user will pick)
        setSelectedAccountIds([]);
      }
    };
    fetchAccountsForPlatforms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platforms]);

  const submitPost = async () => {
    if (!platforms.length) {
      toast.error("Please select at least one platform");
      return;
    }
    if (!selectedAccountIds.length) {
      toast.error("Please select at least one account");
      return;
    }

    if (!mediaUrl && !selectedFile) {
      toast.error("Please provide a media URL or Upload a file");
      return;
    }

    // if a file is selected, send multipart/form-data, otherwise send JSON
    let res;
    if (selectedFile) {
      const fd = new FormData();
      fd.append("media", selectedFile);
      if (caption) fd.append("caption", caption);
      fd.append("platforms", JSON.stringify(platforms));
      fd.append("accountIds", JSON.stringify(selectedAccountIds));
      if (scheduleDate) fd.append("scheduleAt", scheduleDate.toISOString());
      // mediaUrl not sent when file uploaded
      res = await callApi("/posts", "post", fd, true);
    } else {
      const payload: any = {
        platforms,
        accountIds: selectedAccountIds,
        mediaUrl,
        caption,
      };
      if (scheduleDate) {
        payload.scheduleAt = scheduleDate.toISOString();
      }
      res = await callApi("/posts", "post", payload, true);
    }
    if (res) {
      setSheetOpen(false);
      // reset form
      setPlatforms([]);
      setAccounts([]);
      setSelectedAccountIds([]);
      setMediaUrl("");
      setScheduleDate(undefined);
      if (selectedFilePreview) {
        URL.revokeObjectURL(selectedFilePreview);
      }
      setSelectedFile(null);
      setSelectedFilePreview(null);
      setCaption("");
      setDatePickerOpen(false);
      fetchPosts();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Posts</h2>
          <Input
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">instagram</SelectItem>
              <SelectItem value="facebook">facebook</SelectItem>
              <SelectItem value="tik-tok">tik-tok</SelectItem>
              <SelectItem value="youtube">youtube</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val: string | "all") => setStatusFilter(val)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {allTaskStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="hover:cursor-pointer"
            onClick={() => {
              setSearch("");
              setPlatformFilter("all");
              setStatusFilter("all");
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
              New Post
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[50%] sm:max-w-4xl">
            <SheetHeader>
              <SheetTitle>Add / schedule a post</SheetTitle>
              <SheetDescription>
                Choose platforms and accounts, provide media URL and optional
                date/time to schedule.
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 space-y-4 overflow-auto max-h-[70vh]">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Platforms
                </label>
                <div className="flex gap-3">
                  {allPlatforms.map((p) => (
                    <label key={p} className="inline-flex items-center gap-2">
                      <Checkbox
                        checked={platforms.includes(p as ISocialPlatform)}
                        onCheckedChange={(val) => {
                          if (val === true) {
                            setPlatforms((prev) =>
                              prev.includes(p as ISocialPlatform)
                                ? prev
                                : [...prev, p as ISocialPlatform]
                            );
                          } else {
                            setPlatforms((prev) =>
                              prev.filter((x) => x !== (p as ISocialPlatform))
                            );
                          }
                        }}
                      />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Accounts
                </label>
                {accounts.length ? (
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-auto border rounded p-2">
                    {accounts.map((a: any) => (
                      <label
                        key={a.id}
                        className="inline-flex items-center gap-2"
                      >
                        <Checkbox
                          checked={selectedAccountIds.includes(a.id)}
                          onCheckedChange={(val) => {
                            if (val === true) {
                              setSelectedAccountIds((prev) =>
                                prev.includes(a.id) ? prev : [...prev, a.id]
                              );
                            } else {
                              setSelectedAccountIds((prev) =>
                                prev.filter((x) => x !== a.id)
                              );
                            }
                          }}
                        />
                        <span className="text-sm">
                          {a.name ?? a.accountId ?? a.id}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select platforms above to load accounts
                  </div>
                )}
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-1">
                    Media URL
                  </label>
                  <Input
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      // if user types a media URL, clear any selected file
                      if (selectedFilePreview) {
                        URL.revokeObjectURL(selectedFilePreview);
                      }
                      setSelectedFile(null);
                      setSelectedFilePreview(null);
                    }}
                  />
                </div>

                <div className="flex items-center px-2">
                  <span className="text-sm text-muted-foreground">OR</span>
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-1">
                    Upload media (image or video)
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) {
                        // clear media URL when file selected
                        setMediaUrl("");
                        setSelectedFile(f);
                        if (selectedFilePreview)
                          URL.revokeObjectURL(selectedFilePreview);
                        const url = URL.createObjectURL(f);
                        setSelectedFilePreview(url);
                      } else {
                        if (selectedFilePreview)
                          URL.revokeObjectURL(selectedFilePreview);
                        setSelectedFile(null);
                        setSelectedFilePreview(null);
                      }
                    }}
                  />

                  {selectedFilePreview ? (
                    <div className="mt-2">
                      {selectedFile &&
                      selectedFile.type.startsWith("video/") ? (
                        <video
                          src={selectedFilePreview}
                          controls
                          className="max-h-40"
                        />
                      ) : (
                        <img
                          src={selectedFilePreview}
                          alt="preview"
                          className="max-h-40"
                        />
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedFile?.name}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Caption
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption (optional)"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Schedule (optional)
                </label>
                <DateTimePicker
                  date={scheduleDate ?? new Date()}
                  setDate={setScheduleDate}
                  open={datePickerOpen}
                  setOpen={setDatePickerOpen}
                />
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
                <Button className="hover:cursor-pointer" onClick={submitPost}>
                  Add Post
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
              <TableHead>Username</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Media URL</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.length ? (
              posts.map((p) => (
                <TableRow key={p._id ?? p.mediaUrl}>
                  <TableCell>{p.username}</TableCell>
                  <TableCell>{p.platform}</TableCell>
                  <TableCell>
                    {p.scheduleAt ? formatDate(p.scheduleAt) : "—"}
                  </TableCell>
                  <TableCell>{p.status ? String(p.status) : "—"}</TableCell>
                  <TableCell>
                    {p.mediaUrl ? (
                      <a
                        href={p.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="hover:cursor-pointer"
                      onClick={async () => {
                        if (!p.taskId) {
                          toast.error("No taskId for this post");
                          return;
                        }
                        try {
                          const res: any = await callApi(
                            `/tasks/${p.taskId}/cancel`,
                            "get",
                            undefined,
                            false
                          );
                          if (
                            res &&
                            (res.success === undefined || res.success !== false)
                          ) {
                            toast.success("Task cancelled");
                            fetchPosts();
                          } else {
                            toast.error(
                              res && typeof res === "object" && "message" in res
                                ? res.message
                                : "Failed to cancel task"
                            );
                          }
                        } catch (err) {
                          toast.error("Failed to cancel task");
                        }
                      }}
                      disabled={
                        !p.taskId || !canCancelStatus.includes(p.status)
                      }
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Posts;
