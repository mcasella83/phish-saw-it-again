import React from "react";
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
                <li>
                  Initial version to retrieve information about Show, Songs, and
                  Venues
                </li>
              </ul>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <footer className="mt-8 text-sm text-gray-600">
        Any issues or feedback, contact{" "}
        <a href="mailto:sawitagainstats@gmail.com" className="text-blue-600 hover:underline">
          sawitagainstats@gmail.com
        </a>
      </footer>
    </div>
  );
}
