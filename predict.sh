#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate tf2x && python /home/upc/下载/model_prediction_backup/model_prediction_backup/main.py  --element "$1" --date "$2" --mode "$3" --resolution "$4" --test "True"
