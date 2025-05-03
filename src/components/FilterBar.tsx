
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FilterState } from "@/types";
import { CARD_TYPES, LOCATIONS } from "@/utils/mockData";

interface FilterBarProps {
  onApplyFilters: (filters: FilterState) => void;
  initialFilters: FilterState;
}

const FilterBar = ({ onApplyFilters, initialFilters }: FilterBarProps) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <Card className="mb-6 p-4 bg-secondary border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Applied Card</label>
          <Select 
            value={filters.appliedCard} 
            onValueChange={(value) => setFilters({ ...filters, appliedCard: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cards</SelectItem>
              {CARD_TYPES.map((card) => (
                <SelectItem key={card.name} value={card.name}>{card.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select 
            value={filters.location} 
            onValueChange={(value) => setFilters({ ...filters, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
          </label>
          <Slider 
            defaultValue={[filters.ageRange[0], filters.ageRange[1]]} 
            min={18} 
            max={80} 
            step={1}
            onValueChange={(values) => 
              setFilters({ 
                ...filters, 
                ageRange: [values[0], values[1]] as [number, number] 
              })
            }
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Credit Score: {filters.creditScoreRange[0]} - {filters.creditScoreRange[1]}
          </label>
          <Slider 
            defaultValue={[filters.creditScoreRange[0], filters.creditScoreRange[1]]} 
            min={300} 
            max={850} 
            step={10}
            onValueChange={(values) => 
              setFilters({ 
                ...filters, 
                creditScoreRange: [values[0], values[1]] as [number, number] 
              })
            }
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Income (SAR): {filters.incomeLevel[0].toLocaleString()} - {filters.incomeLevel[1].toLocaleString()}
          </label>
          <Slider 
            defaultValue={[filters.incomeLevel[0], filters.incomeLevel[1]]} 
            min={3000} 
            max={50000} 
            step={1000}
            onValueChange={(values) => 
              setFilters({ 
                ...filters, 
                incomeLevel: [values[0], values[1]] as [number, number] 
              })
            }
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Debt Burden Ratio: {filters.debtBurdenRatio[0].toFixed(2)} - {filters.debtBurdenRatio[1].toFixed(2)}
          </label>
          <Slider 
            defaultValue={[filters.debtBurdenRatio[0], filters.debtBurdenRatio[1]]} 
            min={0} 
            max={1} 
            step={0.01}
            onValueChange={(values) => 
              setFilters({ 
                ...filters, 
                debtBurdenRatio: [values[0], values[1]] as [number, number] 
              })
            }
            className="py-4"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleApplyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Apply Filters
        </Button>
      </div>
    </Card>
  );
};

export default FilterBar;
