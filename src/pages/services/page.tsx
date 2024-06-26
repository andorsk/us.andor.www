import { serviceDescriptions} from './data';

export default function ServicePage {
    return (
        <div>
            <h1>Services</h1>
            <div>
                {serviceDescriptions.map((service) => (
                    <div key={service.id}>
                        <h2>{service.name}</h2>
                        <p>{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
