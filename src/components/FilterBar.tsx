
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterState } from "@/types";
import { CARD_TYPES, LOCATIONS } from "@/utils/mockData";
import { COBRAND_PARTNERS } from "@/utils/cobrandPartners";

interface FilterBarProps {
  initialFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

const FilterBar = ({ initialFilters, onApplyFilters }: FilterBarProps) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <Card className="mb-6 border border-white/10">
      <CardHeader className="pb-3">
        <CardTitle>Filter Applications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {/* Card Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Card Type</label>
          <Select
            value={filters.appliedCard}
            onValueChange={(value) =>
              setFilters({ ...filters, appliedCard: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Card Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_cards">All Cards</SelectItem>
              {CARD_TYPES.map((card) => (
                <SelectItem key={card.name} value={card.name}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cobrand Partner Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cobrand Partner</label>
          <Select
            value={filters.cobrandPartner || "all_partners"}
            onValueChange={(value) =>
              setFilters({ 
                ...filters, 
                cobrandPartner: value === "all_partners" ? undefined : value 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_partners">All Partners</SelectItem>
              {COBRAND_PARTNERS.filter(p => p.id !== "none").map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select
            value={filters.location}
            onValueChange={(value) =>
              setFilters({ ...filters, location: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_locations">All Locations</SelectItem>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Age Range</label>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <Input
              type="number"
              value={filters.ageRange[0]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  ageRange: [parseInt(e.target.value), filters.ageRange[1]],
                })
              }
              className="w-20"
              min={18}
              max={100}
            />
            <span>to</span>
            <Input
              type="number"
              value={filters.ageRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  ageRange: [filters.ageRange[0], parseInt(e.target.value)],
                })
              }
              className="w-20"
              min={18}
              max={100}
            />
          </div>
        </div>

        {/* Credit Score Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Credit Score Range</label>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <Input
              type="number"
              value={filters.creditScoreRange[0]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  creditScoreRange: [
                    parseInt(e.target.value),
                    filters.creditScoreRange[1],
                  ],
                })
              }
              className="w-20"
              min={300}
              max={850}
            />
            <span>to</span>
            <Input
              type="number"
              value={filters.creditScoreRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  creditScoreRange: [
                    filters.creditScoreRange[0],
                    parseInt(e.target.value),
                  ],
                })
              }
              className="w-20"
              min={300}
              max={850}
            />
          </div>
        </div>

        {/* Income Level Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Income Level (SAR)</label>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <Input
              type="number"
              value={filters.incomeLevel[0]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  incomeLevel: [
                    parseInt(e.target.value),
                    filters.incomeLevel[1],
                  ],
                })
              }
              className="w-20"
              min={0}
            />
            <span>to</span>
            <Input
              type="number"
              value={filters.incomeLevel[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  incomeLevel: [
                    filters.incomeLevel[0],
                    parseInt(e.target.value),
                  ],
                })
              }
              className="w-20"
              min={0}
            />
          </div>
        </div>

        {/* Debt Burden Ratio Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Debt Burden Ratio</label>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <Input
              type="number"
              value={filters.debtBurdenRatio[0]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  debtBurdenRatio: [
                    parseFloat(e.target.value),
                    filters.debtBurdenRatio[1],
                  ],
                })
              }
              className="w-20"
              min={0}
              max={1}
              step={0.01}
            />
            <span>to</span>
            <Input
              type="number"
              value={filters.debtBurdenRatio[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  debtBurdenRatio: [
                    filters.debtBurdenRatio[0],
                    parseFloat(e.target.value),
                  ],
                })
              }
              className="w-20"
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleApplyFilters} className="ml-auto">
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FilterBar;
