#!/bin/bash
cd /home/ubuntu/stock-influencer-hub
pnpm exec tsx scripts/collect-twitter-data.ts >> /tmp/cron-collect.log 2>&1
