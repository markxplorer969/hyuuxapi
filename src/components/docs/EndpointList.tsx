import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EndpointRow = {
  key?: string;
  name: string;
  desc?: string;
  method: string;
  endpoint: string;
  params?: Record<string, any>;
  category?: string;
};

export default function EndpointList({ endpoints, onTry }: { endpoints: EndpointRow[]; onTry: (e: { endpoint: string; method: string; name: string; category: string }) => void }) {
  if (!endpoints || endpoints.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">No endpoints to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {endpoints.map((ep, idx) => (
        <div key={ep.key ?? idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <Badge className={cn(
                "text-xs font-mono mr-2",
                ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100' :
                ep.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' :
                'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-100'
              )}>
                {ep.method}
              </Badge>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{ep.name}</h4>
                  <code className="text-xs text-muted-foreground">{ep.endpoint}</code>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{ep.desc}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              onTry({ endpoint: ep.endpoint, method: ep.method, name: ep.name, category: ep.category || '' });
            }}>
              Try
            </Button>
            <a href={ep.endpoint.startsWith('/') ? ep.endpoint : undefined} className="hidden md:inline-block">
              <Button variant="ghost" size="sm">Open</Button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
