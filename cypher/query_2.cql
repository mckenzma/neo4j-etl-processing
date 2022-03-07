CALL apoc.periodic.iterate(
  '
  UNWIND range(1,10000,1) AS int
  RETURN int
  ','
  MERGE (n:Test_2 {id: int})-[:IS_CONNECTED_TO]->(m:Another {id: int})
  ',
  {batchSize:100}
)