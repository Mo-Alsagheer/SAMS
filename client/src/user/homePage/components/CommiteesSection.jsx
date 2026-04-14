import React from "react";
import Cards from "./Cards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function CommitteesSection() {
  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Explore our <span className="text-blue-700">Committees</span>
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Discover the core of our community's work.
            </p>
          </div>

          <Button
            asChild
            className="bg-blue-700 hover:bg-blue-800 text-white p-7 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-200 text-lg"
          >
            <Link to="/committees">View All Committees</Link>
          </Button>
        </div>

        <Cards />
      </div>
    </section>
  );
}

export default CommitteesSection;
