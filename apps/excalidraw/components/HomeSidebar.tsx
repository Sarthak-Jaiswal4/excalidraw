'use client'
import React from "react";
import {
  Home,
  Users,
  Folder,
  Trash2,
  Settings,
  Menu,
  Star,
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroupLabel, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupContent } from "./ui/sidebar";

const sidebarOptions = [
  {
    label: "Projects",
    icon: <Folder className="w-5 h-5 mr-2" />,
    href: "/dashboard",
  },
  {
    label: "Team",
    icon: <Users className="w-5 h-5 mr-2" />,
    href: "/team",
  },
  {
    label: "Trash",
    icon: <Trash2 className="w-5 h-5 mr-2" />,
    href: "/trash",
  },
];

function HomeSidebar(){
  return (
    <Sidebar>
    <SidebarContent>
        <SidebarGroup>
        <SidebarGroupContent>
            <SidebarMenu>
            {sidebarOptions.map((project) => (
                <SidebarMenuItem key={project.label}>
                <SidebarMenuButton asChild>
                    <a href={project.href}>
                    {project.icon}
                    <span>{project.label}</span>
                    </a>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarGroupContent>
        </SidebarGroup>
    </SidebarContent>
    </Sidebar>
  );
};

export default HomeSidebar;
