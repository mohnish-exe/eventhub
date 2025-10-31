"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Calendar,
  Users,
  Building2,
} from "lucide-react";
import { TextHoverEffect } from "@/components/ui/hover-footer";

function EventHubFooter() {
  // Footer link data customized for EventHub
  const footerLinks = [
    {
      title: "About EventHub",
      links: [
        { label: "Our Mission", href: "#" },
        { label: "How It Works", href: "#" },
        { label: "User Guide", href: "#" },
        { label: "Help Center", href: "#" },
      ],
    },
    {
      title: "Quick Links",
      links: [
        { label: "Create Event", href: "#" },
        { label: "Book Classroom", href: "#" },
        { label: "View Events", href: "#" },
        {
          label: "Live Support",
          href: "#",
        },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#3ca2fa]" />,
      text: "support@eventhub.edu",
      href: "mailto:support@eventhub.edu",
    },
    {
      icon: <Phone size={18} className="text-[#3ca2fa]" />,
      text: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: <MapPin size={18} className="text-[#3ca2fa]" />,
      text: "VIT Chennai",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", href: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
    { icon: <Twitter size={20} />, label: "Twitter", href: "#" },
    { icon: <Users size={20} />, label: "Community", href: "#" },
  ];

  return (
    <footer className="bg-transparent relative h-fit rounded-3xl overflow-hidden m-8">
      <div className="max-w-7xl mx-auto p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold">EventHub</span>
            </div>
            <p className="text-sm leading-relaxed text-justify">
              Streamline your college events with our powerful management platform. 
              Book classrooms, manage approvals, and track participation effortlessly.
            </p>
            <p className="text-base text-gray-400">
              Made by{" "}
              <span className="relative inline-block group cursor-pointer">
                <span className="text-[#3ca2fa] transition-all duration-300 group-hover:text-[#80eeb4] group-hover:scale-110 transform">
                  Mohnish
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#3ca2fa] to-[#80eeb4] opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></span>
              </span>{" "}
              :)
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="hover:text-[#3ca2fa] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-[#3ca2fa] transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-[#3ca2fa] transition-colors">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom - moved above line */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0 mb-8">
          {/* Social icons */}
          <div className="flex space-x-6 text-gray-400">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-[#3ca2fa] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[24rem] -mt-32 -mb-20">
        <TextHoverEffect text="EventHub" className="z-50" />
      </div>
    </footer>
  );
}

export default EventHubFooter;
