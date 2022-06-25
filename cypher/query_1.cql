CALL apoc.periodic.iterate(
  '
  UNWIND range(1,100,1) AS int
  RETURN int
  ','
  MERGE (n:Test_##PARAM## {id: int})
  ',
  {batchSize:1}
)