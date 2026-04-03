"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, Button, ColoredSketchPreview } from "@/components/ui";
import { Category, Sketch } from "@/types";
import { Icons } from "@/lib/icons";
import { useSketchProgress } from "@/hooks";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { notify } from "@/stores/notificationsStore";
import { Heart, Lock } from "lucide-react";

const PREMIUM_UNLOCK_LEVEL = 5;

// Real sketch data with SVG files
const sampleSketches: Sketch[] = [
    // Animals
    {
        id: "butterfly",
        title: "Monarch Butterfly",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 20,
        thumbnail: "/sketches/butterfly.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Nature", "Insects"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "hummingbird",
        title: "Hummingbird Garden",
        category: "animals",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/hummingbird.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Birds", "Flowers"],
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "koi-fish",
        title: "Japanese Koi",
        category: "animals",
        difficulty: "hard",
        estimatedMinutes: 45,
        thumbnail: "/sketches/koi-fish.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Japanese", "Water"],
        createdAt: new Date(),
    },
    {
        id: "owl",
        title: "Wise Owl",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/owl.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Wildlife", "Portrait"],
        createdAt: new Date(),
    },
    {
        id: "fox",
        title: "Woodland Fox",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/fox.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Wildlife", "Forest"],
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "elephant",
        title: "Baby Elephant",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/elephant.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Safari", "Cute"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "peacock",
        title: "Majestic Peacock",
        category: "animals",
        difficulty: "hard",
        estimatedMinutes: 45,
        thumbnail: "/sketches/peacock.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Birds", "Colorful"],
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "dolphin",
        title: "Playful Dolphin",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/dolphin.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Ocean", "Marine"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "sea-turtle",
        title: "Sea Turtle",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/sea-turtle.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Ocean", "Marine"],
        createdAt: new Date(),
    },
    {
        id: "dinosaur",
        title: "T-Rex Adventure",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/dinosaur.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Dinosaurs", "Kids"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "puppy",
        title: "Adorable Puppy",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/puppy.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Dogs", "Kawaii"],
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "lion",
        title: "Baby Lion",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/lion.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Safari", "Cute"],
        createdAt: new Date(),
    },
    {
        id: "cat",
        title: "Kawaii Cat",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/cat.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Cats", "Kawaii"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "bunny",
        title: "Fluffy Bunny",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/bunny.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Easter", "Kawaii"],
        createdAt: new Date(),
    },
    {
        id: "teddy-bear",
        title: "Teddy Bear",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/teddy-bear.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Cute", "Kids"],
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "flamingo",
        title: "Tropical Flamingo",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/flamingo.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Birds", "Tropical"],
        createdAt: new Date(),
    },
    {
        id: "octopus",
        title: "Cute Octopus",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/octopus.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Ocean", "Kawaii"],
        isNew: true,
        createdAt: new Date(),
    },
    // Botanical
    {
        id: "rose",
        title: "Elegant Rose",
        category: "botanical",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/rose.svg",
        svgContent: "",
        regions: [],
        tags: ["Botanical", "Flowers", "Romance"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "lotus",
        title: "Lotus Bloom",
        category: "botanical",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/lotus.svg",
        svgContent: "",
        regions: [],
        tags: ["Botanical", "Meditation", "Asian"],
        createdAt: new Date(),
    },
    {
        id: "sunflower",
        title: "Sunny Sunflower",
        category: "botanical",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/sunflower.svg",
        svgContent: "",
        regions: [],
        tags: ["Botanical", "Flowers", "Summer"],
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "cherry-blossom",
        title: "Cherry Blossom Branch",
        category: "botanical",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/cherry-blossom.svg",
        svgContent: "",
        regions: [],
        tags: ["Botanical", "Japanese", "Spring"],
        isEditorChoice: true,
        createdAt: new Date(),
    },
    // Fantasy
    {
        id: "unicorn",
        title: "Magical Unicorn",
        category: "fantasy",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/unicorn.svg",
        svgContent: "",
        regions: [],
        tags: ["Fantasy", "Magic", "Kids"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "dragon",
        title: "Friendly Dragon",
        category: "fantasy",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/dragon.svg",
        svgContent: "",
        regions: [],
        tags: ["Fantasy", "Dragons", "Fire"],
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "mermaid",
        title: "Beautiful Mermaid",
        category: "fantasy",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/mermaid.svg",
        svgContent: "",
        regions: [],
        tags: ["Fantasy", "Ocean", "Princess"],
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "mushroom-house",
        title: "Fairy Mushroom House",
        category: "fantasy",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/mushroom-house.svg",
        svgContent: "",
        regions: [],
        tags: ["Fantasy", "Fairy", "Cute"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "castle",
        title: "Princess Castle",
        category: "fantasy",
        difficulty: "hard",
        estimatedMinutes: 45,
        thumbnail: "/sketches/castle.svg",
        svgContent: "",
        regions: [],
        tags: ["Fantasy", "Castle", "Princess"],
        createdAt: new Date(),
    },
    // Landscape/Nature
    {
        id: "rainbow",
        title: "Rainbow Dreams",
        category: "landscape",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/rainbow.svg",
        svgContent: "",
        regions: [],
        tags: ["Nature", "Rainbow", "Kids"],
        isNew: true,
        createdAt: new Date(),
    },
    // Mandalas
    {
        id: "mandala",
        title: "Sacred Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 35,
        thumbnail: "/sketches/mandala.svg",
        svgContent: "",
        regions: [],
        tags: ["Geometric", "Mandala", "Meditation"],
        isEditorChoice: true,
        createdAt: new Date(),
    },
    // Space
    {
        id: "astronaut",
        title: "Space Explorer",
        category: "abstract",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/astronaut.svg",
        svgContent: "",
        regions: [],
        tags: ["Space", "Astronaut", "Kids"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    // Kawaii Food
    {
        id: "cupcake",
        title: "Sweet Cupcake",
        category: "abstract",
        difficulty: "easy",
        estimatedMinutes: 15,
        thumbnail: "/sketches/cupcake.svg",
        svgContent: "",
        regions: [],
        tags: ["Kawaii", "Food", "Cute"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "ice-cream",
        title: "Ice Cream Cone",
        category: "abstract",
        difficulty: "easy",
        estimatedMinutes: 15,
        thumbnail: "/sketches/ice-cream.svg",
        svgContent: "",
        regions: [],
        tags: ["Kawaii", "Food", "Summer"],
        createdAt: new Date(),
    },
    // Kawaii Animals (New Hand-drawn style)
    {
        id: "kawaii-deer",
        title: "Kawaii Deer",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/kawaii-deer.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Kawaii", "Cute"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "kawaii-panda",
        title: "Panda with Bamboo",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/kawaii-panda.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Kawaii", "Cute"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "kawaii-corgi",
        title: "Adorable Corgi",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/kawaii-corgi.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Dogs", "Kawaii"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "kawaii-hamster",
        title: "Chubby Hamster",
        category: "animals",
        difficulty: "easy",
        estimatedMinutes: 20,
        thumbnail: "/sketches/kawaii-hamster.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Kawaii", "Cute"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "kawaii-frog",
        title: "Princess Frog",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/kawaii-frog.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Kawaii", "Princess"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "kawaii-sloth",
        title: "Sleepy Sloth",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 25,
        thumbnail: "/sketches/kawaii-sloth.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Kawaii", "Cute"],
        isNew: true,
        createdAt: new Date(),
    },
    // People/Human Drawings
    {
        id: "girl-reading",
        title: "Girl Reading Book",
        category: "people",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/girl-reading.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Reading", "Cozy"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "girl-school",
        title: "Back From School",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 35,
        thumbnail: "/sketches/girl-school.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "School", "Happy"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "girl-garden",
        title: "Girl in Garden",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/girl-garden.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Garden", "Nature"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "girl-umbrella",
        title: "Rainy Day Walk",
        category: "people",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/girl-umbrella.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Rain", "Cozy"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "girl-baking",
        title: "Baking Cupcakes",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/girl-baking.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Cooking", "Kitchen"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "girl-flowers",
        title: "Picking Flowers",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/girl-flowers.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Nature", "Spring"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "girl-beach",
        title: "Beach Sandcastle",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 45,
        thumbnail: "/sketches/girl-beach.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Beach", "Summer"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "boy-soccer",
        title: "Soccer Star",
        category: "people",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/boy-soccer.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Sports", "Soccer"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "boy-fishing",
        title: "Fishing Day",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/boy-fishing.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Nature", "Relaxing"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "kids-swing",
        title: "Playground Fun",
        category: "people",
        difficulty: "hard",
        estimatedMinutes: 40,
        thumbnail: "/sketches/kids-swing.svg",
        svgContent: "",
        regions: [],
        tags: ["People", "Kids", "Playground"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "princess-fairy",
        title: "Princess Fairy",
        category: "fantasy",
        difficulty: "hard",
        estimatedMinutes: 45,
        thumbnail: "/sketches/princess-fairy.svg",
        svgContent: "",
        regions: [],
        tags: ["Fantasy", "Princess", "Magic"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    // =====================================
    // ADULT COLORING - Intricate Mandalas
    // =====================================
    {
        id: "mandala-lotus",
        title: "Lotus Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 60,
        thumbnail: "/sketches/mandala-lotus.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Meditation", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "mandala-geometric",
        title: "Sacred Geometry Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/mandala-geometric.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Geometric", "Adult"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "mandala-floral",
        title: "Floral Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 65,
        thumbnail: "/sketches/mandala-floral.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Floral", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "mandala-paisley",
        title: "Paisley Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/mandala-paisley.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Paisley", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "mandala-sun",
        title: "Celestial Sun Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 65,
        thumbnail: "/sketches/mandala-sun.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Celestial", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "mandala-heart",
        title: "Heart Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 60,
        thumbnail: "/sketches/mandala-heart.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Heart", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // ADULT COLORING - Geometric Patterns
    // =====================================
    {
        id: "geometry-flower-of-life",
        title: "Flower of Life",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/geometry-flower-of-life.svg",
        svgContent: "",
        regions: [],
        tags: ["Sacred Geometry", "Spiritual", "Adult"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-metatron",
        title: "Metatron's Cube",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/geometry-metatron.svg",
        svgContent: "",
        regions: [],
        tags: ["Sacred Geometry", "Spiritual", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-islamic",
        title: "Islamic Star Pattern",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/geometry-islamic.svg",
        svgContent: "",
        regions: [],
        tags: ["Islamic Art", "Geometric", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-tessellation",
        title: "Hexagonal Tessellation",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 65,
        thumbnail: "/sketches/geometry-tessellation.svg",
        svgContent: "",
        regions: [],
        tags: ["Tessellation", "Geometric", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-cubes",
        title: "Optical Illusion Cubes",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 60,
        thumbnail: "/sketches/geometry-cubes.svg",
        svgContent: "",
        regions: [],
        tags: ["Optical Illusion", "3D", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-spirograph",
        title: "Spirograph Art",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/geometry-spirograph.svg",
        svgContent: "",
        regions: [],
        tags: ["Spirograph", "Geometric", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // ADULT COLORING - Detailed Landscapes
    // =====================================
    {
        id: "landscape-mountain-lake",
        title: "Mountain Lake Reflections",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/landscape-mountain-lake.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Mountains", "Adult"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-japanese-garden",
        title: "Japanese Garden",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/landscape-japanese-garden.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Japanese", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-tuscan",
        title: "Tuscan Countryside",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/landscape-tuscan.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Italian", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-ocean-sunset",
        title: "Ocean Sunset",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 65,
        thumbnail: "/sketches/landscape-ocean-sunset.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Ocean", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-enchanted-forest",
        title: "Enchanted Forest",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/landscape-enchanted-forest.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Forest", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    // =====================================
    // ADULT COLORING - Zentangle Art
    // =====================================
    {
        id: "zentangle-heart",
        title: "Zentangle Heart",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/zentangle-heart.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Heart", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-butterfly",
        title: "Zentangle Butterfly",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/zentangle-butterfly.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Butterfly", "Adult"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-abstract",
        title: "Abstract Doodle Art",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/zentangle-abstract.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Abstract", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-owl",
        title: "Zentangle Owl",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/zentangle-owl.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Owl", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-elephant",
        title: "Zentangle Elephant",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/zentangle-elephant.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Elephant", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // ADULT COLORING - Fashion Illustrations
    // =====================================
    {
        id: "fashion-boho-girl",
        title: "Bohemian Girl",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/fashion-boho-girl.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Bohemian", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-70s-hippie",
        title: "70s Hippie Style",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 65,
        thumbnail: "/sketches/fashion-70s-hippie.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Vintage", "Adult"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-art-deco",
        title: "Art Deco Lady",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/fashion-art-deco.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Art Deco", "Adult"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-victorian",
        title: "Victorian Elegance",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/fashion-victorian.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Victorian", "Adult"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    // =====================================
    // NEW ZENTANGLE ANIMALS - Intricate Patterns
    // =====================================
    {
        id: "zentangle-swan",
        title: "Zentangle Swan",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/zentangle-swan.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Swan", "Adult", "Intricate"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-peacock-display",
        title: "Zentangle Peacock Display",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 85,
        thumbnail: "/sketches/zentangle-peacock.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Peacock", "Adult", "Intricate"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-fox-spirit",
        title: "Zentangle Fox",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/zentangle-fox.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Fox", "Adult", "Intricate"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-wolf",
        title: "Zentangle Wolf",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/zentangle-wolf.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Wolf", "Adult", "Intricate"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "zentangle-seahorse",
        title: "Zentangle Seahorse",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/zentangle-seahorse.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Seahorse", "Adult", "Intricate"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // NEW FASHION ILLUSTRATIONS - Cultural Designs
    // =====================================
    {
        id: "fashion-indian-saree",
        title: "Indian Saree",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 85,
        thumbnail: "/sketches/fashion-indian-saree.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Indian", "Adult", "Cultural"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-japanese-kimono",
        title: "Japanese Kimono",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/fashion-japanese-kimono.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Japanese", "Adult", "Cultural"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-renaissance-gown",
        title: "Renaissance Gown",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 90,
        thumbnail: "/sketches/fashion-renaissance-gown.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Renaissance", "Adult", "Historical"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-modern-streetwear",
        title: "Modern Streetwear",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 65,
        thumbnail: "/sketches/fashion-modern-streetwear.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Modern", "Adult", "Streetwear"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "fashion-girl-stylish",
        title: "Stylish Girl Character",
        category: "fashion",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/fashion-girl-stylish.svg",
        svgContent: "",
        regions: [],
        tags: ["Fashion", "Girl", "Adult", "Character", "Coloring Book"],
        isNew: true,
        isFeatured: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    // =====================================
    // NEW GEOMETRIC/MANDALA PATTERNS - Sacred Geometry
    // =====================================
    {
        id: "mandala-celtic-knot",
        title: "Celtic Knot Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 85,
        thumbnail: "/sketches/mandala-celtic-knot.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Celtic", "Adult", "Sacred Geometry"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "mandala-intricate-floral",
        title: "Intricate Floral Mandala",
        category: "mandalas",
        difficulty: "hard",
        estimatedMinutes: 90,
        thumbnail: "/sketches/mandala-intricate-floral.svg",
        svgContent: "",
        regions: [],
        tags: ["Mandala", "Floral", "Adult", "Intricate", "Coloring Book"],
        isNew: true,
        isFeatured: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-star-of-david",
        title: "Star of David",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 70,
        thumbnail: "/sketches/geometry-star-of-david.svg",
        svgContent: "",
        regions: [],
        tags: ["Geometric", "Sacred Geometry", "Adult", "Spiritual"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-crystal-grid",
        title: "Crystal Grid",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/geometry-crystal-grid.svg",
        svgContent: "",
        regions: [],
        tags: ["Geometric", "Crystals", "Adult", "Sacred Geometry"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "geometry-honeycomb",
        title: "Honeycomb Pattern",
        category: "geometric",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/geometry-honeycomb.svg",
        svgContent: "",
        regions: [],
        tags: ["Geometric", "Nature", "Adult", "Pattern"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // NEW LANDSCAPES - Detailed Scenes
    // =====================================
    {
        id: "landscape-northern-lights",
        title: "Northern Lights",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/landscape-northern-lights.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Aurora", "Adult", "Nature"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-desert-dunes",
        title: "Desert Dunes",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/landscape-desert-dunes.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Desert", "Adult", "Nature"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-tropical-beach",
        title: "Tropical Beach",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 85,
        thumbnail: "/sketches/landscape-tropical-beach.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Beach", "Adult", "Tropical"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "landscape-autumn-forest",
        title: "Autumn Forest",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 90,
        thumbnail: "/sketches/landscape-autumn-forest.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Forest", "Adult", "Autumn"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // SEASONAL THEMED DESIGNS
    // =====================================
    {
        id: "seasonal-christmas-tree",
        title: "Christmas Tree",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 85,
        thumbnail: "/sketches/seasonal-christmas-tree.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Christmas", "Adult", "Seasonal"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "seasonal-spring-garden",
        title: "Spring Garden",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/seasonal-spring-garden.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Spring", "Adult", "Seasonal"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
    {
        id: "seasonal-ocean-underwater",
        title: "Ocean Underwater",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 90,
        thumbnail: "/sketches/seasonal-ocean-underwater.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Ocean", "Adult", "Underwater"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "seasonal-night-sky",
        title: "Night Sky",
        category: "landscape",
        difficulty: "hard",
        estimatedMinutes: 85,
        thumbnail: "/sketches/seasonal-night-sky.svg",
        svgContent: "",
        regions: [],
        tags: ["Landscape", "Stars", "Adult", "Astronomy"],
        isNew: true,
        createdAt: new Date(),
    },
    // =====================================
    // IMAGE MATCHING PROMPTS EXACT SKETCHES
    // =====================================
    {
        id: "exact-kawaii-deer",
        title: "Kawaii Deer",
        category: "animals",
        difficulty: "medium",
        estimatedMinutes: 30,
        thumbnail: "/sketches/exact-kawaii-deer.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Kawaii", "Exact"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "exact-butterfly",
        title: "Exact Butterfly",
        category: "animals",
        difficulty: "hard",
        estimatedMinutes: 45,
        thumbnail: "/sketches/exact-butterfly.svg",
        svgContent: "",
        regions: [],
        tags: ["Animals", "Butterfly", "Exact"],
        isNew: true,
        createdAt: new Date(),
    },
    {
        id: "exact-zentangle-heart",
        title: "Exact Zentangle Heart",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 80,
        thumbnail: "/sketches/exact-zentangle-heart.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Heart", "Exact"],
        isNew: true,
        isFeatured: true,
        createdAt: new Date(),
    },
    {
        id: "exact-floral-pattern",
        title: "Exact Floral Pattern",
        category: "zentangle",
        difficulty: "hard",
        estimatedMinutes: 75,
        thumbnail: "/sketches/exact-floral-pattern.svg",
        svgContent: "",
        regions: [],
        tags: ["Zentangle", "Floral", "Exact"],
        isNew: true,
        isEditorChoice: true,
        createdAt: new Date(),
    },
];

const categories: { id: Category | "all"; label: string }[] = [
    { id: "all", label: "All Sketches" },
    { id: "animals", label: "Animals" },
    { id: "people", label: "People" },
    { id: "botanical", label: "Botanical" },
    { id: "fantasy", label: "Fantasy" },
    { id: "geometric", label: "Geometric" },
    { id: "mandalas", label: "Mandalas" },
    { id: "landscape", label: "Landscape" },
    { id: "zentangle", label: "Zentangle" },
    { id: "fashion", label: "Fashion" },
    { id: "abstract", label: "Abstract" },
];

export default function LibraryPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6 pb-20 lg:pb-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-headline font-bold">Sketch Library</h1>
                    <p className="text-on-surface-variant mt-1">Loading sketches...</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-surface-container rounded-2xl aspect-square animate-pulse" />
                    ))}
                </div>
            </div>
        }>
            <LibraryContent />
        </Suspense>
    );
}

function LibraryContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category') as Category | null;

    // Initialize state from URL param, use useMemo pattern to sync with URL
    const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
    const [sortBy, setSortBy] = useState<"popularity" | "newest" | "difficulty">("popularity");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Fetch user's sketch progress
    const { progressMap } = useSketchProgress();

    // Favorites store
    const { loadFavorites, toggle: toggleFavorite, isFavorite } = useFavoritesStore();

    // User level for unlock conditions
    const { level } = useProgressStore();

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Handle favorite toggle
    const handleFavoriteClick = (e: React.MouseEvent, sketchId: string, sketchTitle: string) => {
        e.preventDefault();
        e.stopPropagation();
        const wasFavorited = isFavorite(sketchId);
        toggleFavorite(sketchId);
        notify.success(
            wasFavorited ? "Removed from favorites" : "Added to favorites",
            sketchTitle
        );
    };

    // Derive effective category from URL param or local state
    const effectiveCategory = categoryParam || selectedCategory;

    const filteredSketches = sampleSketches.filter(
        (sketch) => effectiveCategory === "all" || sketch.category === effectiveCategory
    );

    // Helper to get progress status for a sketch
    const getProgressStatus = (sketchId: string) => {
        const progress = progressMap[sketchId];
        if (!progress) return "not-started";
        if (progress.completed_at) return "completed";
        const fillCount = Object.keys(progress.fills || {}).filter(k => k !== "background").length;
        return fillCount > 0 ? "in-progress" : "not-started";
    };

    // Helper to check if sketch is locked (premium content)
    const isSketchLocked = (sketch: Sketch): boolean => {
        const isPremium = Boolean(sketch.isFeatured || sketch.isEditorChoice);
        return isPremium && level < PREMIUM_UNLOCK_LEVEL;
    };

    // Helper to get button text based on progress
    const getButtonText = (sketchId: string, isLocked: boolean) => {
        if (isLocked) return `🔒 Unlock at Level ${PREMIUM_UNLOCK_LEVEL}`;
        const status = getProgressStatus(sketchId);
        if (status === "completed") return "View Artwork";
        if (status === "in-progress") return "Continue";
        return "Start Coloring";
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold">Sketch Library</h1>
                <p className="text-on-surface-variant mt-1">
                    Choose a sketch and start your creative journey
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap scrollbar-hide w-full sm:w-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`
                shrink-0 px-4 py-2 rounded-full font-headline font-medium text-sm
                transition-all duration-150 soft-touch
                ${effectiveCategory === cat.id
                                    ? "bg-primary text-white"
                                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                                }
              `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* View Mode & Sort Controls */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1 shrink-0">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded transition-all ${viewMode === "grid"
                                ? "bg-primary text-white"
                                : "text-on-surface-variant hover:bg-surface-container"
                                }`}
                            aria-label="Grid view"
                        >
                            <Icons.Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded transition-all ${viewMode === "list"
                                ? "bg-primary text-white"
                                : "text-on-surface-variant hover:bg-surface-container"
                                }`}
                            aria-label="List view"
                        >
                            <Icons.List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-on-surface-variant hidden sm:inline">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="bg-surface-container-low border-none rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm font-headline focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-0"
                        >
                            <option value="popularity">Popularity</option>
                            <option value="newest">Newest</option>
                            <option value="difficulty">Difficulty</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sketch Grid/List */}
            <div className={
                viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    : "flex flex-col gap-4"
            }>
                {filteredSketches.map((sketch) => {
                    const progress = progressMap[sketch.id];
                    const status = getProgressStatus(sketch.id);
                    const hasProgress = progress && Object.keys(progress.fills || {}).length > 0;
                    const favorited = isFavorite(sketch.id);
                    const isLocked = isSketchLocked(sketch);

                    return (
                        <Card
                            key={sketch.id}
                            variant="elevated"
                            padding="none"
                            className={`overflow-hidden transition-transform ${viewMode === "list" ? "flex flex-row" : ""
                                }`}
                        >
                            <Link 
                                href={isLocked ? "#" : `/canvas/${sketch.id}`} 
                                onClick={(e) => {
                                    if (isLocked) {
                                        e.preventDefault();
                                        notify.info("Premium Sketch", `Reach Level ${PREMIUM_UNLOCK_LEVEL} to unlock this sketch!`);
                                    }
                                }}
                                className={`${viewMode === "list" ? "flex w-full min-w-0" : "block"} hover:scale-[1.01] transition-transform ${isLocked ? "cursor-not-allowed" : ""}`}
                            >
                                {/* Thumbnail */}
                                <div className={`relative bg-surface-container-low flex items-center justify-center ${viewMode === "list" ? "w-32 sm:w-48 shrink-0" : "aspect-square"
                                    }`}>
                                    {hasProgress ? (
                                        <ColoredSketchPreview
                                            sketchPath={sketch.thumbnail}
                                            fills={progress.fills}
                                            className="absolute inset-0"
                                        />
                                    ) : (
                                        <Image
                                            src={sketch.thumbnail}
                                            alt={sketch.title}
                                            fill
                                            className="object-contain p-4"
                                        />
                                    )}
                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => handleFavoriteClick(e, sketch.id, sketch.title)}
                                        className={`absolute top-1 sm:top-2 left-1 sm:left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                                            favorited
                                                ? "bg-red-500 text-white shadow-lg"
                                                : "bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 hover:bg-white shadow-md"
                                        }`}
                                        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
                                    </button>
                                    {/* Lock Overlay for Premium Sketches */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                                            <div className="text-center text-white">
                                                <Lock className="w-8 h-8 mx-auto mb-1" />
                                                <p className="text-xs font-medium">Level {PREMIUM_UNLOCK_LEVEL}</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Badges */}
                                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 flex-wrap justify-end max-w-[calc(100%-2rem)]">
                                        {status === "in-progress" && (
                                            <span className="bg-yellow-500 text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                In Progress
                                            </span>
                                        )}
                                        {status === "not-started" && sketch.isNew && (
                                            <span className="bg-primary text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                NEW
                                            </span>
                                        )}
                                        {sketch.isFeatured && (
                                            <span className="bg-secondary text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                ⭐
                                            </span>
                                        )}
                                        {sketch.isEditorChoice && (
                                            <span className="bg-tertiary text-white text-xs font-headline font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                                👑
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className={`p-3 sm:p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-center min-w-0 overflow-hidden" : ""}`}>
                                    <h3 className="font-headline font-bold mb-1 text-sm sm:text-base truncate w-full">{sketch.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3 shrink-0 flex-wrap">
                                        <span className="capitalize">{sketch.difficulty}</span>
                                        <span>•</span>
                                        {status === "completed" ? (
                                            <span className="text-green-600 font-medium">Completed ✓</span>
                                        ) : (
                                            <span>~{sketch.estimatedMinutes} min</span>
                                        )}
                                    </div>
                                    {viewMode === "list" && sketch.tags && (
                                        <div className="flex gap-1 mb-3 flex-wrap overflow-hidden">
                                            {sketch.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs bg-surface-container px-2 py-1 rounded-full text-on-surface-variant shrink-0 max-w-full truncate"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <Button
                                        variant={isLocked ? "secondary" : status === "completed" ? "secondary" : "primary"}
                                        size="sm"
                                        className={`w-full text-xs sm:text-sm ${isLocked ? "opacity-70" : ""}`}
                                    >
                                        {getButtonText(sketch.id, isLocked)}
                                    </Button>
                                </div>
                            </Link>
                        </Card>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center gap-4 pt-8">
                <p className="text-sm text-on-surface-variant">
                    Showing {filteredSketches.length} of {sampleSketches.length} artistic templates
                </p>
                <Button variant="secondary" size="md">
                    Discover More Sketches ↓
                </Button>
            </div>
        </div>
    );
}
