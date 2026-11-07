import React, { useState } from "react";
import { Sidebar, ImageUpload } from "../components";
import { HiOutlineSave } from "react-icons/hi";
import {
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface CustomSpecRow {
  label: string;
  value: string;
}

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();

  // Basic Information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("E-Bikes");
  const [price, setPrice] = useState("1850.00");
  const [inStock, setInStock] = useState("12");
  const [manufacturer, setManufacturer] = useState("Vanguard Mobility Works (Brescia, Italy)");
  const [mainImage, setMainImage] = useState(
    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=80"
  );

  // Dedicated E-Bike Specifications
  const [showEbikeSpecs, setShowEbikeSpecs] = useState(true);
  const [motor, setMotor] = useState("750W Bafang Brushless Geared Hub Motor (Peak 1050W)");
  const [battery, setBattery] = useState("48V 17.5Ah (840Wh) Samsung Removable Lithium-Ion");
  const [range, setRange] = useState("45–65 Miles (72–105 km) with Pedal Assist");
  const [topSpeed, setTopSpeed] = useState("28 mph (45 km/h) Class 3 E-Bike");
  const [frame, setFrame] = useState("6061 Hydroformed Aircraft-Grade Aluminum Alloy");
  const [brakes, setBrakes] = useState("Tektro Dual Hydraulic Disc Brakes (180mm Rotors)");
  const [gears, setGears] = useState("Shimano Altus 8-Speed Rapidfire Drivetrain");
  const [tires, setTires] = useState('20" x 4.0" Kenda All-Terrain Puncture-Resistant Fat Tires');
  const [payload, setPayload] = useState("Bike: 27 kg (59.5 lbs) | Max Capacity: 150 kg (330 lbs)");
  const [chargeTime, setChargeTime] = useState("4.5 Hours with 3A Fast Charger");

  // Dynamic Custom Specs
  const [customSpecs, setCustomSpecs] = useState<CustomSpecRow[]>([
    { label: "Display", value: '3.5" Backlit Color LCD with USB Charging Port' },
    { label: "Throttle", value: "Half-Twist Throttle + 5-Level Intelligent Pedal Assist" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCustomSpec = () => {
    setCustomSpecs([...customSpecs, { label: "", value: "" }]);
  };

  const handleRemoveCustomSpec = (index: number) => {
    setCustomSpecs(customSpecs.filter((_, idx) => idx !== index));
  };

  const handleUpdateCustomSpec = (index: number, field: "label" | "value", val: string) => {
    const next = [...customSpecs];
    next[index][field] = val;
    setCustomSpecs(next);
  };

  const handleAutoFillEbikeDefaults = () => {
    setMotor("750W Bafang Brushless Geared Hub Motor (Peak 1050W)");
    setBattery("48V 17.5Ah (840Wh) Samsung Removable Lithium-Ion");
    setRange("45–65 Miles (72–105 km) with Pedal Assist");
    setTopSpeed("28 mph (45 km/h) Class 3 E-Bike");
    setFrame("6061 Hydroformed Aircraft-Grade Aluminum Alloy");
    setBrakes("Tektro Dual Hydraulic Disc Brakes (180mm Rotors)");
    setGears("Shimano Altus 8-Speed Rapidfire Drivetrain");
    setTires('20" x 4.0" Kenda All-Terrain Puncture-Resistant Fat Tires');
    setPayload("Bike: 27 kg (59.5 lbs) | Max Capacity: 150 kg (330 lbs)");
    setChargeTime("4.5 Hours with 3A Fast Charger");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !category) {
      setError("Please fill in all required fields (Product Title, Price, Category).");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Assemble comprehensive specs list
    const finalSpecs: Array<{ label: string; value: string }> = [];

    if (showEbikeSpecs) {
      if (motor.trim()) finalSpecs.push({ label: "Motor", value: motor.trim() });
      if (battery.trim()) finalSpecs.push({ label: "Battery", value: battery.trim() });
      if (range.trim()) finalSpecs.push({ label: "Range", value: range.trim() });
      if (topSpeed.trim()) finalSpecs.push({ label: "Top Speed", value: topSpeed.trim() });
      if (frame.trim()) finalSpecs.push({ label: "Frame", value: frame.trim() });
      if (brakes.trim()) finalSpecs.push({ label: "Brakes", value: brakes.trim() });
      if (gears.trim()) finalSpecs.push({ label: "Gears", value: gears.trim() });
      if (tires.trim()) finalSpecs.push({ label: "Tires", value: tires.trim() });
      if (payload.trim()) finalSpecs.push({ label: "Payload", value: payload.trim() });
      if (chargeTime.trim()) finalSpecs.push({ label: "Charging", value: chargeTime.trim() });
    }

    customSpecs.forEach((s) => {
      if (s.label.trim() && s.value.trim()) {
        finalSpecs.push({ label: s.label.trim(), value: s.value.trim() });
      }
    });

    // Append formatted specs to description for complete catalog compatibility
    let enrichedDescription = description.trim();
    if (finalSpecs.length > 0) {
      const specSummary = "\n\n### Technical Specifications\n" +
        finalSpecs.map((s) => `• **${s.label}**: ${s.value}`).join("\n");
      if (!enrichedDescription.includes("Technical Specifications")) {
        enrichedDescription += specSummary;
      }
    }

    try {
      await api.createProduct({
        title: title.trim(),
        description: enrichedDescription,
        category,
        price: parseFloat(price),
        inStock: parseInt(inStock, 10) || 1,
        manufacturer: manufacturer.trim() || "AccessGlobal Workshop",
        mainImage: mainImage.trim(),
        rating: 5.0,
        popularity: 80,
        specs: finalSpecs,
      });
      navigate("/products");
    } catch (err: any) {
      setError(err.message || "Failed to create product in Supabase database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBF8F3] dark:bg-[#0a0e17] text-[#121516] dark:text-gray-100 transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DAC9] dark:border-white/[0.08]">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#57625B] dark:text-gray-400 mb-1.5">
                <Link to="/products" className="hover:text-[#124330] dark:hover:text-emerald-400">
                  Products
                </Link>
                <HiOutlineChevronRight className="text-xs" />
                <span className="font-semibold text-[#121516] dark:text-white">Create Product</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121516] dark:text-white">
                Add New Product &amp; E-Bike Specs
              </h1>
              <p className="text-xs text-[#57625B] dark:text-gray-400 mt-1">
                Configure direct-from-workshop catalog details, bonded customs provenance, and technical specifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57625B] hover:text-[#121516] bg-white dark:bg-white/[0.05] border border-[#E5DAC9] dark:border-white/[0.1] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#124330] hover:bg-[#1A5B42] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <HiOutlineSave className="text-base" />
                <span>{submitting ? "Publishing to Supabase..." : "Publish Product"}</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Core Information & Specs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5DAC9] dark:border-white/[0.08] shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#124330] dark:text-emerald-400">
                  Basic Product Information
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1.5">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Vanguard Apex All-Terrain Electric Commuter Bike"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-sm text-[#121516] dark:text-white focus:outline-none focus:border-[#124330]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (e.target.value.includes("Bike")) setShowEbikeSpecs(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-semibold text-[#121516] dark:text-white focus:outline-none focus:border-[#124330]"
                    >
                      <option value="E-Bikes">E-Bikes</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Perfumes">Perfumes</option>
                      <option value="Accessories">Accessories</option>
                      <option value="E-Bikes & Clean Transit">E-Bikes &amp; Clean Transit</option>
                      <option value="Bikes & Scooters">Bikes &amp; Scooters</option>
                      <option value="Smartphones & Mobile">Smartphones &amp; Mobile</option>
                      <option value="Laptops & Workstations">Laptops &amp; Workstations</option>
                      <option value="Audio & Acoustics">Audio &amp; Acoustics</option>
                      <option value="Wearables & Smartwatches">Wearables &amp; Smartwatches</option>
                      <option value="Cameras & Optics">Cameras &amp; Optics</option>
                      <option value="Measuring Instruments">Measuring Instruments</option>
                      <option value="Joinery & Workshop Tools">Joinery &amp; Workshop Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1.5">
                      Workshop / Manufacturer
                    </label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="e.g. Vanguard Mobility Works (Brescia, Italy)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs text-[#121516] dark:text-white focus:outline-none focus:border-[#124330]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1.5">
                    Product Description &amp; Overview
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe craftsmanship, provenance, battery lifecycle, and workshop certifications..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs text-[#121516] dark:text-white focus:outline-none focus:border-[#124330]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1.5">
                      Unit Price ($ USD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-sm font-mono font-semibold text-[#121516] dark:text-white focus:outline-none focus:border-[#124330]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1.5">
                      Ready Units in Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={inStock}
                      onChange={(e) => setInStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-sm font-mono font-semibold text-[#121516] dark:text-white focus:outline-none focus:border-[#124330]"
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated E-Bike Specifications Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5DAC9] dark:border-white/[0.08] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DAC9] dark:border-white/[0.06]">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#124330] dark:text-emerald-400">
                      E-Bike Technical Specifications
                    </h2>
                    <p className="text-[11px] text-[#57625B] dark:text-gray-400 mt-0.5">
                      These specifications are automatically rendered on the customer spec sheet and deep inspection modal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillEbikeDefaults}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E9F2ED] text-[#124330] hover:bg-[#d6e8de] transition-colors"
                    title="Auto-fill recommended E-Bike values"
                  >
                    <HiOutlineSparkles className="text-xs" />
                    <span>Auto-Fill Defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Motor Power &amp; Type
                    </label>
                    <input
                      type="text"
                      value={motor}
                      onChange={(e) => setMotor(e.target.value)}
                      placeholder="e.g. 750W Bafang Brushless Rear Hub"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Battery &amp; Voltage
                    </label>
                    <input
                      type="text"
                      value={battery}
                      onChange={(e) => setBattery(e.target.value)}
                      placeholder="e.g. 48V 17.5Ah (840Wh) Samsung Cells"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Max Range per Charge
                    </label>
                    <input
                      type="text"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      placeholder="e.g. 45–65 Miles (72–105 km)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Top Speed &amp; Class
                    </label>
                    <input
                      type="text"
                      value={topSpeed}
                      onChange={(e) => setTopSpeed(e.target.value)}
                      placeholder="e.g. 28 mph (45 km/h) Class 3"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Frame Material &amp; Geometry
                    </label>
                    <input
                      type="text"
                      value={frame}
                      onChange={(e) => setFrame(e.target.value)}
                      placeholder="e.g. 6061 Hydroformed Aircraft Aluminum"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Brake System
                    </label>
                    <input
                      type="text"
                      value={brakes}
                      onChange={(e) => setBrakes(e.target.value)}
                      placeholder="e.g. Tektro Hydraulic Disc Brakes 180mm"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Gears &amp; Transmission
                    </label>
                    <input
                      type="text"
                      value={gears}
                      onChange={(e) => setGears(e.target.value)}
                      placeholder="e.g. Shimano Altus 8-Speed Rapidfire"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Tires &amp; Suspension
                    </label>
                    <input
                      type="text"
                      value={tires}
                      onChange={(e) => setTires(e.target.value)}
                      placeholder='e.g. 20" x 4.0" All-Terrain Puncture-Resistant'
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Bike Weight &amp; Max Payload
                    </label>
                    <input
                      type="text"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      placeholder="e.g. Weight: 27 kg | Capacity: 150 kg"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#121516] dark:text-gray-200 mb-1">
                      Charging Time
                    </label>
                    <input
                      type="text"
                      value={chargeTime}
                      onChange={(e) => setChargeTime(e.target.value)}
                      placeholder="e.g. 4.5 Hours with 3A Fast Charger"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs font-mono text-[#121516] dark:text-white"
                    />
                  </div>
                </div>

                {/* Additional Custom Technical Specs */}
                <div className="pt-4 border-t border-[#E5DAC9] dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#121516] dark:text-white">
                      Additional Specifications (Key-Value)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCustomSpec}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#124330] dark:text-emerald-400 hover:underline"
                    >
                      <HiOutlinePlus className="text-sm" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  {customSpecs.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => handleUpdateCustomSpec(idx, "label", e.target.value)}
                        placeholder="Specification Name (e.g. Headlight)"
                        className="w-1/3 px-3 py-1.5 rounded-lg bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs text-[#121516] dark:text-white"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleUpdateCustomSpec(idx, "value", e.target.value)}
                        placeholder="Specification Value (e.g. 60 Lux High-Output LED)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#FBF8F3] dark:bg-white/[0.03] border border-[#E5DAC9] dark:border-white/[0.08] text-xs text-[#121516] dark:text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSpec(idx)}
                        className="p-1.5 text-[#57625B] hover:text-rose-600 transition-colors"
                        title="Delete specification"
                      >
                        <HiOutlineTrash className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Media Preview & Guidelines */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5DAC9] dark:border-white/[0.08] shadow-sm space-y-4">
                <ImageUpload
                  value={mainImage}
                  onChange={setMainImage}
                  label="Featured Product Image"
                  helperText="Upload photography directly from your machine or provide an external CDN link."
                />
              </div>

              {/* Provenance & E-Bike Standards Info */}
              <div className="p-5 rounded-2xl bg-[#E9F2ED] border border-[#124330]/20 text-[#124330] space-y-2 text-xs">
                <p className="font-bold">E-Bike Provenance Standards:</p>
                <p className="text-[11px] leading-relaxed text-[#124330]/90">
                  All E-Bikes listed on AccessGlobal include pre-cleared lithium transport documentation, CE/UL2849 safety certification verification, and duty-paid door-to-door bonded shipping.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateProduct;
