const organsWithAnatomicalIds = [
  {
      "label": "urinary bladder",
      "anatomicalId": "UBERON:0001255",
  },
  {
      "label": "brainstem",
      "anatomicalId": "UBERON:0002298",
  },
  {
      "label": "caecum",
      "anatomicalId": "UBERON:0001153",
  },
  {
      "label": "colon",
      "anatomicalId": "UBERON:0001155",
  },
  {
      "label": "esophagus",
      "anatomicalId": "UBERON:0001043",
  },
  {
      "label": "small intestine",
      "anatomicalId": "UBERON:0002108",
  },
  {
      "label": "stomach",
      "anatomicalId": "UBERON:0000945",
  },
  {
      "label": "heart",
      "anatomicalId": "UBERON:0000948",
  },
  {
      "label": "lung",
      "anatomicalId": "UBERON:0002048",
  },
];

const getOrganMaps = () => {
    const curatedMap = {};
    organsWithAnatomicalIds.forEach((item) => {
        const label = item.label.toLowerCase();
        if (!(label in curatedMap))
            curatedMap[label.toLowerCase()] = item["anatomicalId"];
    });
    return curatedMap;
};

export { getOrganMaps };
