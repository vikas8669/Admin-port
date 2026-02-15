"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./ui/resizable-navbar";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import {Link} from "react-router-dom";

export default function NavbarDemo() {
  const navItems = [
    {
      name: "Project",
      link: "/project",
    },
    {
      name: "ContactUs",
      link: "/contact",
    },
        {
      name: "Blog",
      link: "/blog",
    },

  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full flex ">
      <Navbar className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 ">
        {/* ================= Desktop ================= */}
        <NavBody className="text-neutral-900 dark:text-neutral-100">
          <NavbarLogo />
          <NavItems className="flex justify-end px-18 gap" items={navItems} />

          <div className="">
            <NavbarButton variant="primary">
              <ThemeToggle />
            </NavbarButton>
          </div>
        </NavBody>

        {/* ================= Mobile ================= */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-neutral-600 dark:text-neutral-300 text-lg"
              >
                {item.name}
              </Link>
            ))}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
