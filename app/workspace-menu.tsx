import { ImageDown, Menu as MenuIcon, Monitor, Moon, Sun } from "lucide-react";
import { exportImageShortcut } from "../src/keyboard-shortcuts";
import { Button } from "./ui/button";
import { Dropdown } from "./ui/dropdown";
import { Group } from "./ui/group";
import { Menu, MenuItem, MenuSeparator } from "./ui/menu";

export default function WorkspaceMenu() {
  return (
    <header
      className="floating-toolbar fixed top-[var(--workspace-inset)] left-[var(--workspace-inset)] z-[4] w-max"
      id="workspace-menu"
    >
      <h1 className="sr-only">Schema Studio</h1>
      <Dropdown
        id="menu-panel"
        trigger={{
          id: "toggle-menu",
          variant: "plain",
          radius: "lg",
          className:
            "menu-trigger floating-surface grid size-[var(--floating-control-height)] place-items-center enabled:hover:bg-ui-hover aria-expanded:bg-ui-hover aria-expanded:text-ui-keyboard",
          "aria-label": "Workspace menu",
          children: <MenuIcon aria-hidden="true" />,
        }}
        panel={Menu}
        placement="below-start"
        panelProps={{
          className: "menu-panel w-[min(240px,calc(100vw-48px))]",
        }}
      >
        <MenuItem
          className="menu-action"
          id="open-export"
          type="button"
          aria-haspopup="dialog"
          shortcut={exportImageShortcut}
          disabled
        >
          <ImageDown aria-hidden="true" /> Export image
        </MenuItem>
        <MenuSeparator />
        <div className="menu-theme flex h-8 items-center justify-between gap-3 px-2.5 text-ui-size/[normal] font-[650]">
          <span>Theme</span>
          <Group
            variant="framed"
            className="theme-picker flex-none gap-[3px] p-0.5"
            role="group"
            aria-label="Color theme"
          >
            <Button
              variant="toggle"
              radius="md"
              className="swatch-control aria-pressed:bg-[#f4f7fb] aria-pressed:text-[#375a7c]"
              data-theme-choice="light"
              aria-label="Light theme"
              title="Light theme"
              aria-pressed="false"
            >
              <Sun aria-hidden="true" />
            </Button>
            <Button
              variant="toggle"
              radius="md"
              className="swatch-control aria-pressed:bg-[#3f4350] aria-pressed:text-[#e3e7f0]"
              data-theme-choice="dark"
              aria-label="Dark theme"
              title="Dark theme"
              aria-pressed="false"
            >
              <Moon aria-hidden="true" />
            </Button>
            <Button
              variant="toggle"
              radius="md"
              className="swatch-control aria-pressed:bg-ui-hover aria-pressed:text-ui-ink"
              data-theme-choice="system"
              aria-label="Follow system theme"
              title="Follow system theme"
              aria-pressed="true"
            >
              <Monitor aria-hidden="true" />
            </Button>
          </Group>
        </div>
      </Dropdown>
    </header>
  );
}
