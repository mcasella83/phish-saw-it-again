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
    <div className="flex flex-col min-h-screen relative">
      <div className="pb-16">
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">About this site</h2>
          <h3>I love Phish and all the surrounding statistics.</h3>
          <h3>
            This site was inspired by The Number Line, and I used it as a chance
            to learn React.{" "}
          </h3>
          <h3>
            To use the site, you just need a profile with your shows at{" "}
            <a href="https://phish.net">https://phish.net</a>
          </h3>
        </div>

        <div className="space-y-4 mt-16">
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
                      Initial version to retrieve information about Show, Songs,
                      and Venues
                    </li>
                  </ul>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-sm text-gray-600 border-t bg-background">
        <div className="container mx-auto text-center">
          Issues or feedback? contact{" "}
          <a
            href="mailto:sawitagainstats@gmail.com"
            className="text-blue-600 hover:underline"
          >
            sawitagainstats@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
