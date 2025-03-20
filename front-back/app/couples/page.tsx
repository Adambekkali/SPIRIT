import React from "react";

const getCouples = async () => {
    const res = await fetch("http://localhost:3000/api/couples");
    const data = await res.json();
    console.log(data);
    return data;
}

const Couples = async () => {
    const couples = await getCouples();
    return (
        <div>
            <h1>Couples</h1>

            <table>
                <thead>
                    <tr>
                        <Th>Numéro de licence</Th>
                        <Th>Nom du cavalier</Th>
                        <Th>Prénom du cavalier</Th>
                        <Th>Coach</Th>
                        <Th>Ecurie</Th>
                    </tr>
                </thead>
                <tbody>
                    {couples.map((couple: any) => (
                        <tr key={couple.id}>
                            <td>{couple.numero_licence}</td>
                            <td>{couple.nom_cavalier}</td>
                            <td>{couple.prenom_cavalier}</td>
                            <td>{couple.coach}</td>
                            <td>{couple.ecurie}</td>
                            <td>{couple.numero_sire}</td>
                            <td>{couple.nom_cheval}</td>
                            <td>{couple.numero_passage}</td>
                            <td>{couple.statut}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Couples;

const Th = ({ children }: { children: React.ReactNode }) => {
    return (
        <th className="border-2 border-gray-300 rounded-md p-2">
            {children}
        </th>
    )
}
