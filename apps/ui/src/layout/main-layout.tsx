import { Outlet } from "react-router";
// import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
// import { LogOut, ShieldUser, User, UserPen } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

const AppLayout = () => {
  return (
    <SidebarProvider>
      {/* <AppSidebar /> */}
      <SidebarInset>
        {/* <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          Profile Dropdown
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-2 hover:bg-gray-100 hover:cursor-pointer">
                <User className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="hover:cursor-pointer">
                <div className="flex">
                  <UserPen />
                  <Link to="/profile">Profile</Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:cursor-pointer">
                <div className="flex">
                  <ShieldUser />
                  <Link to="/change-password">Change Password</Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:cursor-pointer">
                <div className="flex">
                  <LogOut />
                  <Link to="/logout">Logout</Link>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header> */}

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
