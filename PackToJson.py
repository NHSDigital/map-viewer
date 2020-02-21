import json
import csv

jsonl = ""

with open("export (1).csv", "r") as input_file:
    reader = csv.DictReader(input_file)
    for line in reader:
        line["Count"] = int(line["Count"])
        jsonl += json.dumps(dict(line)) + "\n"


with open("ExampleUnorderedDataLines.json", "r") as input_json:
    thing = json.load(input_json)
    thing["datasets"].append({
        "$meta": {
            "name": "Query One - Top 200 Hospitals",
            "preserveOrder": False,
            "format": "jsonlines",
            "rows": [{
                "name": "Count",
                "type": "number",
                "datatype": "quantifier"
            }, {
                "name": "Postcode",
                "type": "string",
                "datatype": "location",
                "format": "postcode"
            }, {
                "name": "Name",
                "type": "string",
                "datatype": "descriptor"
            },
            {
                "name": "Provider",
                "type": "string",
                "datatype": "descriptor"
            }]
        },
        "data": jsonl
    })

    with open("output.json", "w+") as output_file:
        output_file.write(json.dumps(thing))
        output_file.close()


