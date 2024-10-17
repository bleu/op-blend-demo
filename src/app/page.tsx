// src/BlendAggregator.js
"use client";
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { FaWallet, FaCopy, FaExclamationCircle, FaBell } from "react-icons/fa";

const initialMockData = {
  USDC: {
    Mode: { LayerBank: 3.5, IonicProtocol: 3.2 },
    Base: { MorphoBlue: 3.8, AAVEV3: 3.6, Moonwell: 3.4 },
    Optimism: { AAVEV3: 3.7, CompoundV3: 3.3, SiloFinance: 3.5 },
  },
  ETH: {
    Mode: { LayerBank: 2.1, IonicProtocol: 2.0 },
    Base: { MorphoBlue: 2.3, AAVEV3: 2.2, Moonwell: 2.1 },
    Optimism: { AAVEV3: 2.2, CompoundV3: 2.0, SiloFinance: 2.1 },
  },
};

// Simulated user reward data
const initialRewardsData = [
  { date: "2023-10-01", rewards: 10 },
  { date: "2023-10-02", rewards: 15 },
  { date: "2023-10-03", rewards: 12 },
];

const BlendAggregator = () => {
  const [mockData, setMockData] = useState(initialMockData);
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [actionType, setActionType] = useState("supply");
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null); // Simulated wallet address
  const [amount, setAmount] = useState("");
  const [positions, setPositions] = useState([]);
  const [referralCode, setReferralCode] = useState("BLEND123");
  const [rewards, setRewards] = useState(0);
  const [rewardsData, setRewardsData] = useState(initialRewardsData);
  const [notifications, setNotifications] = useState([]); // New notifications state
  const { toast } = useToast();

  // New state variables for the bridge
  const [sourceChain, setSourceChain] = useState("Ethereum");
  const [destinationChain, setDestinationChain] = useState("Optimism");
  const [bridgeAsset, setBridgeAsset] = useState("USDC");
  const [bridgeAmount, setBridgeAmount] = useState("");

  useEffect(() => {
    updateBestRate();
  }, [selectedAsset, actionType, mockData]);

  useEffect(() => {
    // Simulate rates changing over time
    const interval = setInterval(() => {
      const newMockData = { ...mockData };
      Object.keys(newMockData).forEach((asset) => {
        Object.keys(newMockData[asset]).forEach((chain) => {
          Object.keys(newMockData[asset][chain]).forEach((protocol) => {
            let rate = newMockData[asset][chain][protocol];
            // Simulate rate change by +/- up to 0.2%
            const change = (Math.random() - 0.5) * 0.4;
            rate = Math.max(0, rate + change);
            newMockData[asset][chain][protocol] = parseFloat(rate.toFixed(2));
          });
        });
      });
      setMockData(newMockData);
      checkPositionRates(newMockData);
    }, 5000); // Update rates every 5 seconds

    return () => clearInterval(interval);
  }, [mockData, positions]);

  const updateBestRate = () => {
    // No longer needed since we compute best rate on the fly
  };

  const connectWallet = () => {
    // Simulate wallet connection
    const simulatedAccount = "0x1234...ABCD";
    setWalletConnected(true);
    setAccount(simulatedAccount);

    const newNotification = {
      title: "Wallet Connected",
      description: "You have successfully connected your wallet.",
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);

    toast({
      title: newNotification.title,
      description: newNotification.description,
      duration: 3000,
    });
  };

  const handleAction = () => {
    const bestRate = findBestRate(selectedAsset, actionType);
    if (walletConnected && amount && bestRate && parseFloat(amount) > 0) {
      // Simulated transaction
      const newPosition = {
        asset: selectedAsset,
        amount: parseFloat(amount),
        type: actionType,
        protocol: bestRate.protocol,
        chain: bestRate.chain,
        rate: bestRate.rate,
        isOptimal: true,
      };
      setPositions([...positions, newPosition]);
      setAmount("");

      const notification = {
        title: "Transaction Successful",
        description: `You have ${actionType}ed ${formatNumber(
          newPosition.amount
        )} ${newPosition.asset} at ${newPosition.rate}% APY.`,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev]);

      toast({
        title: notification.title,
        description: notification.description,
        duration: 3000,
      });

      // Simulate earning rewards
      const newReward = Math.random() * 5;
      setRewards((prev) => prev + newReward);

      // Update rewards data for the chart
      const today = new Date().toISOString().split("T")[0];
      setRewardsData((prevData) => [
        ...prevData,
        { date: today, rewards: newReward },
      ]);
    } else {
      const errorNotification = {
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        timestamp: new Date(),
      };
      setNotifications((prev) => [errorNotification, ...prev]);

      toast({
        title: errorNotification.title,
        description: errorNotification.description,
        duration: 3000,
        status: "error",
      });
    }
  };

  const handleOptimize = () => {
    const optimizedPositions = positions.map((pos) => {
      const currentBest = findBestRate(pos.asset, pos.type);
      return {
        ...pos,
        protocol: currentBest.protocol,
        chain: currentBest.chain,
        rate: currentBest.rate,
        isOptimal: true,
      };
    });
    setPositions(optimizedPositions);

    const notification = {
      title: "Positions Optimized",
      description: "Your positions have been optimized to the best rates.",
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);

    toast({
      title: notification.title,
      description: notification.description,
      duration: 3000,
    });
  };

  const handleBridge = () => {
    if (
      walletConnected &&
      bridgeAmount &&
      parseFloat(bridgeAmount) > 0 &&
      sourceChain !== destinationChain
    ) {
      // Simulate bridge transaction
      const notification = {
        title: "Bridge Transaction Initiated",
        description: `Bridging ${formatNumber(
          parseFloat(bridgeAmount)
        )} ${bridgeAsset} from ${sourceChain} to ${destinationChain}.`,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev]);

      toast({
        title: notification.title,
        description: notification.description,
        duration: 3000,
      });
      setBridgeAmount("");
    } else {
      const errorNotification = {
        title: "Invalid Bridge Transaction",
        description: "Please check your inputs and try again.",
        timestamp: new Date(),
      };
      setNotifications((prev) => [errorNotification, ...prev]);

      toast({
        title: errorNotification.title,
        description: errorNotification.description,
        duration: 3000,
        status: "error",
      });
    }
  };

  const findBestRate = (asset, type) => {
    let best = {
      rate: type === "supply" ? 0 : Infinity,
      protocol: "",
      chain: "",
    };
    Object.entries(mockData[asset]).forEach(([chain, protocols]) => {
      Object.entries(protocols).forEach(([protocol, rate]) => {
        if (
          (type === "supply" && rate > best.rate) ||
          (type === "borrow" && rate < best.rate)
        ) {
          best = { rate, protocol, chain };
        }
      });
    });
    return best;
  };

  const checkPositionRates = (newMockData) => {
    const updatedPositions = positions.map((pos) => {
      const currentBest = findBestRate(pos.asset, pos.type);
      const isOptimal =
        (pos.type === "supply" && pos.rate >= currentBest.rate) ||
        (pos.type === "borrow" && pos.rate <= currentBest.rate);
      return { ...pos, isOptimal };
    });
    setPositions(updatedPositions);
  };

  // Simulated analytics data
  const analyticsData = {
    labels: rewardsData.map((data) => data.date),
    datasets: [
      {
        label: "OP Tokens Earned",
        data: rewardsData.map((data) => data.rewards),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 1)",
      },
    ],
  };

  const formatNumber = (number) => {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-400">
              Blend Aggregator
            </h1>
            <div className="flex items-center space-x-4">
              {/* Notifications Icon */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <FaBell />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-gray-800 text-gray-100 p-4">
                  <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                  {notifications.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <li
                          key={index}
                          className="mb-2 border-b border-gray-700 pb-2"
                        >
                          <p className="font-semibold">{notification.title}</p>
                          <p className="text-sm">{notification.description}</p>
                          <p className="text-xs text-gray-400">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No notifications</p>
                  )}
                </PopoverContent>
              </Popover>

              {/* Wallet Connection */}
              <div className="flex items-center">
                <FaWallet className="mr-2" />
                {walletConnected ? (
                  <span>{`Connected: ${account}`}</span>
                ) : (
                  <Button variant="primary" onClick={connectWallet}>
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>
            {/* Above the Fold Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Protocol Rates and Actions */}
              <Card className="p-6 bg-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-indigo-400">
                    Explore Best Rates
                  </h2>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAction}
                    disabled={!walletConnected || !amount}
                    className="mt-4 lg:mt-0"
                  >
                    {actionType.charAt(0).toUpperCase() + actionType.slice(1)}{" "}
                    Now
                  </Button>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-6">
                  <div className="flex-grow mb-4 lg:mb-0">
                    <Select
                      onValueChange={(value) => setSelectedAsset(value)}
                      value={selectedAsset}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-grow mb-4 lg:mb-0">
                    <Select
                      onValueChange={(value) => setActionType(value)}
                      value={actionType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supply">Supply</SelectItem>
                        <SelectItem value="borrow">Borrow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-grow">
                    <Input
                      type="number"
                      placeholder={`Amount to ${actionType}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                {/* Protocol Rates Table */}
                <Tabs defaultValue={Object.keys(mockData[selectedAsset])[0]}>
                  <TabsList>
                    {Object.keys(mockData[selectedAsset]).map((chain) => (
                      <TabsTrigger key={chain} value={chain}>
                        {chain}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(mockData[selectedAsset]).map(
                    ([chain, protocols]) => (
                      <TabsContent key={chain} value={chain} className="mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Protocol</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(protocols).map(
                              ([protocol, rate]) => (
                                <TableRow key={protocol}>
                                  <TableCell>{protocol}</TableCell>
                                  <TableCell className="text-right">
                                    {formatNumber(rate)}%
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                    )
                  )}
                </Tabs>
              </Card>

              {/* Positions and Portfolio */}
              <Card className="p-6 bg-gray-800">
                <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
                  Your Portfolio
                </h2>
                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 text-center bg-gray-700">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Portfolio Value
                    </h3>
                    <p className="text-2xl font-bold text-indigo-300">
                      $
                      {formatNumber(
                        positions.reduce((total, pos) => total + pos.amount, 0)
                      )}
                    </p>
                  </Card>
                  <Card className="p-4 text-center bg-gray-700">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Rewards Earned
                    </h3>
                    <p className="text-2xl font-bold text-indigo-300">
                      {formatNumber(rewards)} OP
                    </p>
                  </Card>
                </div>
                {/* Positions List */}
                <h3 className="text-xl font-semibold text-gray-300 mb-4">
                  Your Positions
                </h3>
                {positions.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Protocol</TableHead>
                          <TableHead>Chain</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.map((pos, index) => (
                          <TableRow key={index}>
                            <TableCell>{pos.type}</TableCell>
                            <TableCell>{formatNumber(pos.amount)}</TableCell>
                            <TableCell>{pos.asset}</TableCell>
                            <TableCell>{pos.protocol}</TableCell>
                            <TableCell>{pos.chain}</TableCell>
                            <TableCell className="text-right">
                              {formatNumber(pos.rate)}%
                            </TableCell>
                            <TableCell>
                              {pos.isOptimal ? (
                                <Badge variant="success">Optimal</Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Not Optimal
                                  <Tooltip content="Click to optimize">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleOptimize}
                                      className="ml-2"
                                    >
                                      <FaExclamationCircle />
                                    </Button>
                                  </Tooltip>
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleOptimize}
                      className="w-full mt-6"
                    >
                      Optimize Positions
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-400">No positions yet.</p>
                )}
              </Card>
            </div>

            {/* ERC20 Bridge Section */}
            <div className="mt-8">
              <Card className="p-6 bg-gray-800">
                <h2 className="text-2xl font-semibold text-indigo-400 mb-6">
                  ERC20 Bridge
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      onValueChange={(value) => setSourceChain(value)}
                      value={sourceChain}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Source Chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ethereum">Ethereum</SelectItem>
                        <SelectItem value="Optimism">Optimism</SelectItem>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Mode">Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      onValueChange={(value) => setDestinationChain(value)}
                      value={destinationChain}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Destination Chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ethereum">Ethereum</SelectItem>
                        <SelectItem value="Optimism">Optimism</SelectItem>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Mode">Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      onValueChange={(value) => setBridgeAsset(value)}
                      value={bridgeAsset}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Amount to Bridge"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBridge}
                  disabled={!walletConnected || !bridgeAmount}
                  className="w-full mt-6"
                >
                  Bridge Assets
                </Button>
              </Card>
            </div>

            {/* Below the Fold Content */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-gray-800">
                <h2 className="text-2xl font-semibold text-indigo-400 mb-6">
                  Rewards Over Time
                </h2>
                <Line data={analyticsData} options={{ responsive: true }} />
              </Card>

              {/* Referral Program */}
              <Card className="p-6 bg-gray-800">
                <h2 className="text-2xl font-semibold text-indigo-400 mb-6">
                  Referral Program
                </h2>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                  <p className="flex-grow text-gray-300 mb-4 md:mb-0">
                    Invite friends and earn rewards! Share your referral code:
                  </p>
                  <div className="flex items-center">
                    <Input
                      type="text"
                      value={referralCode}
                      readOnly
                      className="flex-grow"
                    />
                    <Tooltip content="Copy Code">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode);

                          const notification = {
                            title: "Copied",
                            description: "Referral code copied to clipboard.",
                            timestamp: new Date(),
                          };
                          setNotifications((prev) => [notification, ...prev]);

                          toast({
                            title: notification.title,
                            description: notification.description,
                            duration: 2000,
                          });
                        }}
                        className="ml-2"
                      >
                        <FaCopy />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-8 text-center text-gray-500">
            <p>© 2024 Blend Aggregator. All rights reserved.</p>
          </footer>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default BlendAggregator;
