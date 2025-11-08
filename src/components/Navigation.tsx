import { useLocation, useNavigate } from "react-router";
import { Tab, TabIndicator, TabList, TabListContainer, TabsRoot, TooltipContent, TooltipRoot } from "@heroui/react";
import { Home, Camera, Keyboard, HomeIcon, Users, MessageCircle } from "lucide-react";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/screenshot-ai", label: "Screenshot AI", icon: Camera },
    { path: "/key-monitor", label: "Key Monitor", icon: Keyboard },
  ];

  console.log(location)

  return (
    <div className="fixed bottom-2 left-0 right-0 text-center">
      <TabsRoot
        className="w-full max-w-md mx-auto rounded-full bg-gray-200 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-20 border border-gray-100"
        onSelectionChange={(id) => {
          navigate({
            pathname: id === 'home' ? '/' : '/' + id,
          }, { replace: true })
        }}
      >
        <TabListContainer>
          <TabList aria-label="Options">
            <TooltipRoot delay={0}>
              <Tab id="home">
                <HomeIcon size={20} />
                <TabIndicator />
              </Tab>
              <TooltipContent>
                <p>Your home</p>
              </TooltipContent>
            </TooltipRoot>

            <TooltipRoot delay={0}>
              <Tab id="players">
                <Users size={20} />
                <TabIndicator />
              </Tab>
              <TooltipContent>
                <p>Players</p>
              </TooltipContent>
            </TooltipRoot>
            
            <TooltipRoot delay={0}>
              <Tab id="discussion">
                <MessageCircle size={20} />
                <TabIndicator />
              </Tab>
              <TooltipContent>
                <p>Team dicussion</p>
              </TooltipContent>
            </TooltipRoot>
          </TabList>
        </TabListContainer>
      </TabsRoot>
    </div>
  );
}