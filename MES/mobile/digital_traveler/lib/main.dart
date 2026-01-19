import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/glass_theme.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const DigitalTravelerApp());
}

class DigitalTravelerApp extends StatelessWidget {
  const DigitalTravelerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Digital Traveler',
      debugShowCheckedModeBanner: false,
      theme: GlassTheme.themeData,
      home: const HomeScreen(),
    );
  }
}
