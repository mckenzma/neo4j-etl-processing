CALL apoc.periodic.iterate(
  '
  UNWIND range(1,10,1) AS int
  RETURN int
  ','
  MERGE (n:Test_1 {id: int})
  ',
  {batchSize:1}
)