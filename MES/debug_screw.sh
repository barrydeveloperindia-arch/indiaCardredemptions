#!/bin/bash
export FC_INPUT_FILE='/app/storage/parts/Screw.SLDPRT'
export FC_OUTPUT_FILE='/app/storage/parts/Screw.converted.step'
echo "Starting Debug Conversion..."
ls -l $FC_INPUT_FILE
freecadcmd -c "exec(open('/app/src/part_analysis/fc_convert.py').read())"
echo "Conversion Finished. Checking Output:"
ls -l $FC_OUTPUT_FILE
