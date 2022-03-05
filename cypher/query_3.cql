CALL apoc.periodic.iterate(
  '
  UNWIND range(1,10,1) AS int
  RETURN in
  ','
  MERGE (n:Test_3 {id: int})
  ',
  {batchSize:1}
)