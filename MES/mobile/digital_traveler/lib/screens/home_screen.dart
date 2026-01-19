import 'package:flutter/material.dart';
import 'package:glass_kit/glass_kit.dart'; // Assuming glass_kit usage or custom
import '../theme/glass_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Digital Traveler"),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFE2E8F0), Color(0xFFF1F5F9)],
              ),
            ),
          ),
          
          // Content
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   // Status Card & Workflow Checklist (Engineer Agent)
                   Container(
                     padding: const EdgeInsets.all(24),
                     decoration: GlassTheme.glassDecoration,
                     child: Column(
                       children: [
                         const Icon(Icons.precision_manufacturing, size: 48, color: Color(0xFF2563EB)),
                         const SizedBox(height: 16),
                         Text(
                           "CNC-HighPerf-05",
                           style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                         ),
                         const SizedBox(height: 8),
                         const Text(
                           "Running Job: #JOB-1245",
                           style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold),
                         ),
                         const Divider(height: 30),
                         
                         // Workflow Steps
                         _buildStepTile("1. Printing", true),
                         _buildStepTile("2. Washing", false),
                         _buildStepTile("3. Curing", false),
                         _buildStepTile("4. QC Check", false),
                       ],
                     ),
                   ),
                   
                   const SizedBox(height: 32),
                   
                   // Action Button
                   ElevatedButton.icon(
                     onPressed: () {
                       // Scan navigate
                     },
                     icon: const Icon(Icons.qr_code_scanner),
                     label: const Text("SCAN JOB TICKET"),
                     style: ElevatedButton.styleFrom(
                       backgroundColor: const Color(0xFF2563EB),
                       foregroundColor: Colors.white,
                       padding: const EdgeInsets.symmetric(vertical: 20),
                       textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                     ),
                   ),
                   
                   const SizedBox(height: 32),
                   
                   Text("Upcoming Queue", style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                   const SizedBox(height: 16),
                   
                   // List Items
                   Expanded(
                     child: ListView.builder(
                       itemCount: 3,
                       itemBuilder: (context, index) {
                         return Container(
                           margin: const EdgeInsets.only(bottom: 12),
                           padding: const EdgeInsets.all(16),
                           decoration: BoxDecoration(
                             color: Colors.white,
                             borderRadius: BorderRadius.circular(12),
                             border: Border.all(color: Colors.grey.shade200),
                           ),
                           child: Row(
                             children: [
                               Container(
                                 padding: const EdgeInsets.all(8),
                                 decoration: BoxDecoration(
                                   color: Colors.blue.shade50,
                                   borderRadius: BorderRadius.circular(8),
                                 ),
                                 child: Text("#10${index + 1}", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                               ),
                               const SizedBox(width: 16),
                               Column(
                                 crossAxisAlignment: CrossAxisAlignment.start,
                                 children: [
                                   Text("Aero Bracket v${index + 2}", style: const TextStyle(fontWeight: FontWeight.w600)),
                                   Text("PLA • 45m", style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                                 ],
                               ),
                             ],
                           ),
                         );
                       },
                     ),
                   ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepTile(String title, bool isCompleted) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(
            isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
            color: isCompleted ? Colors.green : Colors.grey,
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: isCompleted ? Colors.black87 : Colors.grey,
              decoration: isCompleted ? TextDecoration.lineThrough : null,
            ),
          ),
        ],
      ),
    );
  }
}
