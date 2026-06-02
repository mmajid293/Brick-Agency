"use client";

import { Boxes, Users, TrendingUp, Package, AlertCircle, Fuel, Thermometer, Truck } from "lucide-react";
import { formatPKR, formatNumber } from "@/lib/utils";
import { useApp } from "@/context/app-context";

interface StatsProps {
  bricksToday: number;
  presentWorkers: number;
  totalWorkers: number;
  monthSales: number;
  pendingPayments: number;
  kilnTemp: number;
  fuelToday: number;
  todayDispatches: number;
  monthProfit: number;
}

export function StatsCards(props: StatsProps) {
  const { translate, locale } = useApp();
  const labelClass = locale === "ur" ? "font-urdu" : "";

  const cards = [
    { icon: Boxes, label: translate("todayProduction"), value: formatNumber(props.bricksToday) },
    { icon: Users, label: translate("workersPresent"), value: `${props.presentWorkers}/${props.totalWorkers}` },
    { icon: TrendingUp, label: translate("totalSales"), value: formatPKR(props.monthSales) },
    { icon: Package, label: translate("rawStock"), value: "6 Types" },
    { icon: AlertCircle, label: translate("pendingPayments"), value: String(props.pendingPayments), alert: true },
    { icon: Fuel, label: translate("fuelConsumption"), value: `${props.fuelToday} tons` },
    { icon: Thermometer, label: translate("kilnTemp"), value: `${props.kilnTemp}°C` },
    { icon: Truck, label: translate("dispatch"), value: String(props.todayDispatches) },
  ];

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`glass-card heat-glow min-w-0 overflow-hidden rounded-xl p-4 sm:p-5 ${card.alert ? "border-error/30" : ""}`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <h3
                className={`min-w-0 flex-1 text-xs font-medium uppercase leading-snug tracking-wide text-on-surface-variant ${labelClass}`}
              >
                {card.label}
              </h3>
              <span className="shrink-0 rounded-lg bg-primary-container/20 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p
              className="font-display text-lg font-bold leading-tight text-on-surface sm:text-xl md:text-2xl break-words"
              title={card.value}
            >
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
