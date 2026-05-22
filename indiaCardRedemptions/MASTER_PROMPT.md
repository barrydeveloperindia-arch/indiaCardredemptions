# MASTER PROMPT

**Context:** 
You are an expert mobile developer. We are building a production-ready, cross-platform app (iOS & Android) called **"The Points Array"**. The goal of the app is to help Indian credit card holders calculate and find the most profitable hotel redemptions (Marriott, Accor, Hilton) based on their specific Indian credit cards (e.g., Axis Atlas, Magnus for Burgundy, Amex Platinum, HDFC Infinia).

**Tech Stack:**
Please build this using **React Native with Expo** (using Expo Router). Use a modern, ultra-premium "Dark Mode" aesthetic with glassmorphism panels, deep black backgrounds, and sleek typography (Apple-esque design). 

**Phase 1 Objectives (Do this first):**
1. Initialize the Expo app in this directory.
2. Create a static `loyalty_matrix.json` file in the codebase that maps out the specific transfer ratios for Indian cards (e.g., Axis M4B -> Marriott = 5:4, HDFC Infinia -> Accor = 1:1, Amex -> Marriott = 1:1). Reference `loyalty_matrix_reference.md`.
3. Build the **"Wallet UI"** screen where the user can select their credit cards and input their current point balances. Render the cards beautifully.
4. Build the **"Arbitrage Calculator UI"** screen where the user inputs a hotel's cash price and point price. The app must calculate the "Rupee per Point" yield and visually highlight if the transfer is mathematically profitable.

**Phase 2: The Flight Redemption Routing Engine**
1. Create a `flight_sweet_spots.json` database that maps global regions (e.g., Europe, SE Asia, North America) to the best airline transfer partners for Indian flyers (e.g., Aeroplan for Europe to avoid fuel surcharges, KrisFlyer for SE Asia).
2. Build a **"Where to Fly?" UI** screen. The user selects a region, and the app recommends the top airline programs to transfer their specific credit card points to, including expected miles required for Business Class and tax warnings.

**Instructions & Standard Operating Procedure (SOP):**
1. **Strict TDD:** You must enforce a strict Test-Driven Development (TDD) pipeline. Before building any UI or logic, write Jest tests for the arbitrage calculator and matrix logic. 
2. **Step-by-Step:** Please start by initializing the Expo project, setting up the file structure, and writing the failing TDD tests for the two JSON databases. 
3. Stop and ask for my review before moving to the UI construction. Maintain 100% architectural integrity.
