
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function About() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">About I Saw It Again</h2>
        <p className="text-muted-foreground">
          I Saw It Again is a web application that helps Phish fans track their concert attendance and explore their show statistics.
          View your attended shows, favorite songs, and visited venues all in one place.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Changelog</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>v0.1</TableCell>
              <TableCell>2/17/2024</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  <li>Initial version to retrieve information about Show, Songs, and Venues</li>
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
