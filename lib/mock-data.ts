// Mock data — same pattern used on the Sirisia Alumni build.
// Build every homepage component against this. Swap for real
// Prisma/Supabase queries once the database is connected (Step 2).

export const trustBadges = [
  { label: "ID Verified Workers", icon: "shield-check" },
  { label: "Rated by Real Clients", icon: "star" },
  { label: "Secure M-Pesa Payment", icon: "lock" },
  { label: "Local, Not a Call Centre", icon: "map-pin" },
];

export const whyDifferent = [
  {
    title: "Verified, not anonymous",
    description:
      "Every worker on PataKazi has a confirmed ID and a real work history — not a stranger you found through a poster on a pole.",
  },
  {
    title: "Reviews you can actually trust",
    description:
      "Only clients who paid for a completed job through PataKazi can leave a review. No fake five-star spam.",
  },
  {
    title: "Your money is protected",
    description:
      "Payment sits safely with us until the job is confirmed done — the worker doesn't get paid until you're satisfied.",
  },
  {
    title: "A record that builds over time",
    description:
      "Every completed job adds to a worker's earnings history — real proof of income they can eventually show a bank or sacco.",
  },
];

export const testimonials = [
  {
    name: "Wanjiru K.",
    role: "Homeowner, Kilimani",
    quote:
      "I needed a plumber same-day and was nervous about letting a stranger in. Seeing his rating and past jobs made the decision easy.",
    rating: 5,
  },
  {
    name: "Otieno M.",
    role: "Property Manager, Ruiru",
    quote:
      "We use PataKazi for all our maintenance work now. The contract feature means there's no argument about price afterward.",
    rating: 5,
  },
  {
    name: "James Worker",
    role: "Electrician, Nairobi",
    quote:
      "My earnings page is the first real proof of income I've had in ten years of doing this work. That alone changed things for me.",
    rating: 5,
  },
];

export const serviceAreas = [
  { name: "Nairobi CBD", lat: -1.2864, lng: 36.8172 },
  { name: "Ruiru", lat: -1.1465, lng: 36.9615 },
  { name: "Kilimani", lat: -1.2921, lng: 36.7876 },
  { name: "Thika", lat: -1.0396, lng: 37.0834 },
  { name: "Kikuyu", lat: -1.2469, lng: 36.6642 },
];

export const featuredCategories = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Cleaning & Domestic",
  "Masonry",
  "Appliance Repair",
  "Gardening & Landscaping",
];
