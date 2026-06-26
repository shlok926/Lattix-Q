from typing import List, Dict

class MigrationPlanner:
    def generate_roadmap(self, findings: List[Dict]) -> Dict:
        technologies = list(set(f["technology"] for f in findings))
        
        recommendations = []
        if findings:
            recommendations = [f"For {tech}: {next((f.get('suggestion', 'Upgrade to post-quantum equivalent.') for f in findings if f.get('technology') == tech), 'Upgrade to post-quantum equivalent.')}" for tech in technologies]

        roadmap = {
            "summary": f"Detected {len(findings)} legacy crypto usages across {len(technologies)} technologies.",
            "phases": [
                {
                    "name": "Phase 1: Assessment & Inventory",
                    "duration": "1-2 weeks",
                    "tasks": [
                        "Verify all detected RSA/ECC endpoints.",
                        "Classify data sensitivity (Storage vs Transit)."
                    ]
                },
                {
                    "name": "Phase 2: Hybrid Implementation",
                    "duration": "2-4 weeks",
                    "tasks": [
                        "Implement dual-signature (Classical + PQC) for detected endpoints.",
                        "Update client SDKs to support hybrid handshakes."
                    ]
                },
                {
                    "name": "Phase 3: Full PQC Transition",
                    "duration": "Varies",
                    "tasks": [
                        "Decommission legacy classical algorithms.",
                        "Perform full system audit with QuantumShield."
                    ]
                }
            ],
            "specific_recommendations": recommendations
        }
        return roadmap
