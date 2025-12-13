"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Layers,
  ImageIcon,
  Box,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function DocsPage() {
  const [endpoints, setEndpoints] = useState<any>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/endpoints")
      .then((r) => r.json())
      .then((d) => setEndpoints(d.result || {}));
  }, []);

  const categories = Object.keys(endpoints);

  const searchMatch = (text: string) =>
    text.toLowerCase().includes(search.toLowerCase());

  const iconForCategory = (cat: string) => {
    switch (cat) {
      case "openai":
        return <Layers className="w-4 h-4" />;
      case "downloader":
        return <ImageIcon className="w-4 h-4" />;
      case "random":
        return <Box className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen px-4 pt-24 container">
      <h1 className="text-3xl font-bold">API Documentation</h1>
      <p className="text-muted-foreground mt-1 mb-6">
        Browse all REST endpoints and quickly jump into the in-browser tester.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search endpoints..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <Badge
          variant="outline"
          className="cursor-pointer px-4 py-1"
          onClick={() => setSearch("")}
        >
          All
        </Badge>

        {categories.map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            className="cursor-pointer flex items-center gap-1 px-4 py-1"
            onClick={() => setSearch(cat)}
          >
            {iconForCategory(cat)}
            {cat.replace(/_/g, " ").toUpperCase()}
          </Badge>
        ))}
      </div>

      {/* Endpoint Groups */}
      <div className="space-y-12 pb-16">
        {categories.map((cat) => {
          const group = endpoints[cat] || {};
          const items = Object.keys(group);

          const visibleItems = items.filter((key) => {
            const ep = group[key];
            return (
              searchMatch(ep.name) ||
              searchMatch(ep.endpoint) ||
              searchMatch(cat)
            );
          });

          if (visibleItems.length === 0) return null;

          return (
            <section key={cat}>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
                {iconForCategory(cat)}
                {cat.replace(/_/g, " ").toUpperCase()}
              </h2>

              <div className="w-full overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="p-3 text-left">NO</th>
                      <th className="p-3 text-left">PATH</th>
                      <th className="p-3 text-left">PARAMETER</th>
                      <th className="p-3 text-left">METHOD</th>
                      <th className="p-3 text-left">TRY</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleItems.map((key, i) => {
                      const ep = group[key];
                      const paramKeys = Object.keys(ep.params || {}).join(", ") || "-";

                      const method = Array.isArray(ep.method)
                        ? ep.method.join(" / ")
                        : ep.method;

                      return (
                        <tr key={key} className="border-t">
                          <td className="p-3">{i + 1}</td>
                          <td className="p-3 whitespace-nowrap font-mono">
                            {ep.endpoint}
                          </td>
                          <td className="p-3">{paramKeys}</td>
                          <td className="p-3">
                            <Badge>{method}</Badge>
                          </td>
                          <td className="p-3">
                            <Link
                              href={`/docs/try?category=${cat}&key=${key}`}
                            >
                              <Button variant="outline" size="sm">
                                Try <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
