"use client";

import { useState } from "react";

interface CollaborationRequestProps {
  brand: string;
  campaign: string;
  description: string;
  offer: string;
  status: "awaiting" | "accepted";
  onAccept?: () => void;
  onDecline?: () => void;
}

export function CollaborationRequest({
  brand,
  campaign,
  description,
  offer,
  status,
  onAccept,
  onDecline
}: CollaborationRequestProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleAccept = () => {
    setCurrentStatus("accepted");
    onAccept?.();
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-semibold text-purple-600">{brand}</span>
            <span className="text-lg font-bold text-slate-900">{campaign}</span>
          </div>
          <p className="mb-4 text-sm text-slate-600">{description}</p>
          {currentStatus === "accepted" && (
            <p className="mb-4 text-sm text-green-600 font-medium">
              Accepted - intro call scheduled
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAccept}
              disabled={currentStatus === "accepted"}
              className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-green-600 disabled:opacity-75"
            >
              {currentStatus === "accepted" ? "Accepted" : "Accept & schedule video call"}
            </button>
            {currentStatus === "awaiting" && (
              <>
                <button
                  onClick={onDecline}
                  className="rounded-lg border border-red-300 bg-white px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Decline offer
                </button>
                <button className="rounded-lg border border-purple-300 bg-white px-6 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50">
                  Message {brand} team
                </button>
              </>
            )}
          </div>
        </div>
        <div className="ml-4 text-right">
          <div className="text-lg font-bold text-slate-900">{offer}</div>
          <div
            className={`mt-1 text-sm font-medium ${
              currentStatus === "accepted" ? "text-green-600" : "text-green-600"
            }`}
          >
            {currentStatus === "accepted" ? "Accepted" : "Awaiting response"}
          </div>
        </div>
      </div>
    </div>
  );
}

