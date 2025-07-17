
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SettingsState } from "@/types";

interface SettingsPanelProps {
  settings: SettingsState;
  onSettingsChange: (settings: SettingsState) => void;
}

const SettingsPanel = ({ settings, onSettingsChange }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = React.useState<SettingsState>(settings);

  const handleSaveSettings = () => {
    onSettingsChange(localSettings);
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-secondary">
        <CardHeader>
          <CardTitle>Decision Rules</CardTitle>
          <CardDescription>Configure how credit decisions are made</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="prioritize-dti">Prioritize Lowest DTI</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, credit offers will favor customers with lower debt-to-income ratios
              </p>
            </div>
            <Switch
              id="prioritize-dti"
              checked={localSettings.prioritizeLowestDTI}
              onCheckedChange={(checked) => 
                setLocalSettings({ ...localSettings, prioritizeLowestDTI: checked })
              }
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="min-credit-score">Minimum Credit Score</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="min-credit-score"
                  min={300}
                  max={850}
                  step={10}
                  value={[localSettings.minCreditScore]}
                  onValueChange={(values) => 
                    setLocalSettings({ ...localSettings, minCreditScore: values[0] })
                  }
                  className="flex-grow py-4"
                />
                <span className="w-16 text-center">{localSettings.minCreditScore}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="max-dti">Maximum Debt Burden Ratio</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="max-dti"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[localSettings.maxDebtBurdenRatio]}
                  onValueChange={(values) => 
                    setLocalSettings({ ...localSettings, maxDebtBurdenRatio: values[0] })
                  }
                  className="flex-grow py-4"
                />
                <span className="w-16 text-center">{localSettings.maxDebtBurdenRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="default-welcome-balance">Default Welcome Balance (SAR)</Label>
            <Input
              id="default-welcome-balance"
              type="number"
              value={localSettings.defaultWelcomeBalance}
              onChange={(e) => 
                setLocalSettings({ 
                  ...localSettings, 
                  defaultWelcomeBalance: parseInt(e.target.value) || 0 
                })
              }
              className="bg-background border-white/10"
              title="Predefined amount deposited directly into customer's account upon activation"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
