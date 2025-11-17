import { Outlet, Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/use-api";

const navItems = [
  {
    name: "Accounts",
    link: "/accounts",
  },
  {
    name: "Posts",
    link: "/posts",
  },
  {
    name: "Tasks",
    link: "/tasks",
  },
];

const HorizontalLayout = () => {
  const location = useLocation();

  const { callApi, loading } = useApi();

  const refreshMobile = async () => {
    await callApi("/mobiles/refresh");
  };

  return (
    <div className="flex p-5 h-screen flex-col">
      <div className="flex justify-between gap-2">
        <ButtonGroup>
          {navItems.map((n, idx) => (
            <>
              <Button
                asChild
                size="lg"
                variant={location.pathname === n.link ? "default" : "outline"}
              >
                <Link to={n.link}>{n.name}</Link>
              </Button>
              {idx !== navItems.length - 1 && <ButtonGroupSeparator />}
            </>
          ))}
        </ButtonGroup>
        <Button
          variant="outline"
          onClick={refreshMobile}
          className="hover:cursor-pointer"
        >
          Refresh Devices
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>
      </div>
      <div className="mt-10 border-1 rounded-sm p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default HorizontalLayout;
