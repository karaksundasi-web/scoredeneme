# retry the Wikimedia sound searches until the rate limit lifts (at most ~4 min)
for n in 1 2 3 4 5 6 7 8; do
  out=$(python3 tools/asset_search.py search --q "$1" --type sound --sources wikimedia --max-wait 20 --out "$2" 2>&1)
  echo "$out" | grep -q "429" || { echo "$out" | tail -n 7; exit 0; }
  sleep 30
done
echo "still rate-limited"
