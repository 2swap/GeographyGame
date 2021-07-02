for file in ./*; do
	echo "	$(basename "$file" | cut -d'.' -f 1) : require(\"../../public/geojson/poly/$(basename "$file")\"),"
done
