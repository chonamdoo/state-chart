---- MODULE AuthorizationA ----
EXTENDS TLC
VARIABLES authorized, prepared, executed
vars == <<authorized, prepared, executed>>

Init == /\ authorized = TRUE
        /\ prepared = FALSE
        /\ executed = FALSE

Prepare == /\ ~executed
           /\ prepared' = IF authorized THEN TRUE ELSE prepared
           /\ UNCHANGED <<authorized, executed>>

Cancel == /\ ~executed
          /\ authorized' = FALSE
          /\ UNCHANGED <<prepared, executed>>

Execute == /\ ~executed
           /\ executed' = prepared
           /\ UNCHANGED <<authorized, prepared>>

Done == /\ executed
        /\ UNCHANGED vars

Next == Prepare \/ Cancel \/ Execute \/ Done
Spec == Init /\ [][Next]_vars
TypeOK == /\ authorized \in BOOLEAN
          /\ prepared \in BOOLEAN
          /\ executed \in BOOLEAN
ExecutionRequiresAuthorization == executed => authorized
====
