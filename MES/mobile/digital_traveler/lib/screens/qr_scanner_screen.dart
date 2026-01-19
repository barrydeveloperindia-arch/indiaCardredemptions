import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QRScannerScreen extends StatelessWidget {
  const QRScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Scan Job Ticket")),
      body: MobileScanner(
        onDetect: (capture) {
          final List<Barcode> barcodes = capture.barcodes;
           for (final barcode in barcodes) {
            if (barcode.rawValue != null) {
               // Handle Scan
               debugPrint('Barcode found! ${barcode.rawValue}');
               Navigator.pop(context, barcode.rawValue);
               break; // Return first valid code
            }
          }
        },
      ),
    );
  }
}
