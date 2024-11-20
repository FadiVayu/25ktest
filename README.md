# DONE

in real time  ingestion and queryable data

# TODO

redis based lock for recalc

recalc is its own deployment  /  instance  of this service

recalc reads from a specific topic 
locks redis with node-rd-lock 

reads all that  need recalc
clears
and unlocks and then processes recalculations

near realtime value calculations


