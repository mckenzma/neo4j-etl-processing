MATCH (n:Label)
WITH ##StringReplace## AS string
RETURN count(*)